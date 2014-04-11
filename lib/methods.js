Meteor.methods({
  add_guest: function(episode_id, person_id) {
    Episodes.update({_id:episode_id}, {$addToSet:{guests:person_id}});
    People.update({_id:person_id}, {$addToSet:{guests:episode_id}});
  },
  add_highlight: function(info) {
    var timestamp = (new Date()).getTime();
    info['created_at'] = timestamp;

    var speaker_name = info['_speaker_name'];
    delete info['_speaker_name'];

    var episode_id = info['episode_id'];
    var type = info['type'];
    var company_id = info['company_id'];
    var person_id = info['person_id'];
    var text = info['text'];
    var start_time = info['start_time']
    var editor_id = info['editor_id'] || 'cinjon' //TODO: change after development

    if (speaker_name && !company_id && !person_id && !(type=='link')) { //new company
      company_id = make_company(
        speaker_name, null, null, timestamp, [episode_id]
      );
    }

    if (type == 'note') {
      if (text.slice(0,1) == '"') {
        type = 'quote';
        var start_slice = 1;
        var end_slice = text.length;
        if (text.slice(-1) == '"') {
          end_slice -= 1;
        }
        text = text.slice(start_slice, end_slice);
      }
    }

    var highlight_id = make_highlight(
      type, editor_id, episode_id, null,
      start_time, text, person_id, company_id, null
    );

    var previous_chapter_start_time = 0;
    var previous_chapter = null;
    var found_chapter = false;
    Chapters.find({episode_id:episode_id}, {sort:{start_time:1}}).forEach(function(chapter) {
      if (found_chapter) {
        //do nothing --> TODO: is there a way to break this instead?
      } else if (chapter.next_chapter_id == null) { //end of chapters, put highlight in here
        add_highlight_to_chapter(highlight_id, chapter, start_time);
      } else if (chapter.start_time > start_time && start_time >= previous_chapter_start_time) { //previous chapter was correct one
        if (previous_chapter) {
          add_highlight_to_chapter(highlight_id, previous_chapter, start_time);
        } else { //previous_chapter null, so this must be the first chapter
          add_highlight_to_chapter(highlight_id, chapter, start_time);
        }
        found_chapter = true;
      } else {
        previous_chapter = chapter;
        previous_chapter_start_time = previous_chapter.start_time;
      }
    });
    //Update episode to include highlight
    Episodes.update({_id:episode_id}, {$addToSet:{highlights:highlight_id}});
  },
  add_host: function(episode_id, person_id) {
    Episodes.update({_id:episode_id}, {$addToSet:{hosts:person_id}});
    People.update({_id:person_id}, {$addToSet:{hosts:episode_id}});
  },
  claim_episode: function(episode_id, user_id) {
    Episodes.update({
      _id: episode_id
    }, {
      $set: {
        editor_id: user_id
      }
    });
  },
  new_chapter: function(previous_chapter_id, previous_highlight_start_time, editor_id) {
    editor_id = editor_id || "cinjon"
    var chapter = Chapters.findOne({_id:previous_chapter_id});
    if (!chapter) {
      return {success:false, msg:"Server Error: Chapter Not Found"};
    }

    var highlights_to_move = Highlights.find({
      _id:{$in:chapter.highlights}, start_time:{$gt:previous_highlight_start_time}
    }, {
      sort: {start_time:1}
    }).map(function(highlight) {
      return highlight._id;
    });
    if (highlights_to_move.length == 0) {
      return {success:false, msg:"Server Error: No Highlights Found"}
    }

    var start_time = Highlights.findOne({_id:highlights_to_move[0]}).start_time;
    var new_chapter_id = make_chapter(
      "New Chapter", false, chapter.episode_id, editor_id, start_time,
      highlights_to_move, chapter.next_chapter_id)
    Highlights.update({_id:{$in:highlights_to_move}},
                      {$set:{chapter_id:new_chapter_id}},
                      {multi:true});
    Episodes.update({_id:chapter.episode_id}, {$addToSet:{chapters:new_chapter_id}});
    Chapters.update({_id:chapter._id}, {
      $set: {next_chapter_id:new_chapter_id},
      $pullAll: {highlights:highlights_to_move}
    });
    return {success:true}
  },
  new_host: function(name, episode_id) {
    var timestamp = (new Date()).getTime();
    var names = make_person_names(name);
    var hosts = [episode_id];

    person_id = make_person(
      names[0], names[1], null, null, null, hosts, [], timestamp
    );

    Episodes.update({_id:episode_id}, {$addToSet:{hosts:person_id}});
  },
  new_guest: function(name, episode_id) {
    var timestamp = (new Date()).getTime();
    var names = make_person_names(name);
    var guests = [episode_id];

    person_id = make_person(
      names[0], names[1], null, null, null, [], guests, timestamp
    );
    Episodes.update({_id:episode_id}, {$addToSet:{guests:person_id}});
  },
  remove_chapter: function(chapter_id) {
    var chapter = Chapters.findOne({_id:chapter_id});
    if (chapter.true) {
      return;
    }
    var highlights = chapter.highlights;
    var previous_chapter = Chapters.findOne({
      episode_id:chapter.episode_id, next_chapter_id:chapter_id});
    Chapters.update({_id:previous_chapter._id}, {
      $pushAll:{highlights:highlights},
      $set:{next_chapter_id:chapter.next_chapter_id}
    })
    Chapters.remove({_id:chapter_id});
  },
  remove_guest: function(episode_id, person_id) {
    Episodes.update({_id:episode_id}, {$pull:{guests:person_id}});
    People.update({_id:person_id}, {$pull:{guests:episode_id}});
  },
  remove_highlight: function(highlight_id) {
    var highlight = Highlights.findOne({_id:highlight_id});
    var chapter_id = highlight.chapter_id;
    var episode_id = highlight.episode_id;
    var chapter = Chapters.findOne({_id:chapter_id});

    if (chapter && chapter.highlights.length > 1) {
      Chapters.update({_id:chapter_id}, {$pull:{highlights:highlight_id}});
    } else if (chapter && !chapter.first) {
      Episodes.update({_id:episode_id}, {$pull:{chapters:chapter_id}});
      Chapters.remove({_id:chapter_id});
    }
    Episodes.update({_id:episode_id}, {$pull:{highlights:highlight_id}});
    Highlights.remove({_id:highlight_id});
  },
  remove_host: function(episode_id, person_id) {
    Episodes.update({_id:episode_id}, {$pull:{hosts:person_id}});
    People.update({_id:person_id}, {$pull:{hosts:episode_id}});
  },
  set_chapter_title: function(chapter_id, title) {
    Chapters.update({_id:chapter_id}, {$set:{title:title}});
  },
  set_highlight_text: function(highlight_id, text) {
    Highlights.update({_id:highlight_id}, {$set:{text:text}});
  },
  set_highlight_type: function(highlight_id, type) {
    Highlights.update({_id:highlight_id}, {$set:{type:type}});
  },
  set_start_time: function(highlight_id, seconds) {
    Highlights.update({_id:highlight_id}, {$set:{start_time:seconds}});
  },
  unclaim_episode: function(episode_id, user_id) {
    Episodes.update({
      _id: episode_id, editor_id: user_id
    }, {
      $set: {
        editor_id: null
      }
    });
  },
});

var add_highlight_to_chapter = function(highlight_id, chapter, start_time) {
  Highlights.update({_id:highlight_id}, {$set:{chapter_id:chapter._id}});
  if (!chapter.start_time || chapter.start_time > start_time) {
    //earlier highlight, set chapter time to this time
    Chapters.update(
      {_id:chapter._id},
      {$set:{start_time:start_time}, $addToSet:{highlights:highlight_id}}
    );
  } else {
    Chapters.update(
      {_id:chapter._id},
      {$addToSet:{highlights:highlight_id}}
    );
  }
}

var make_person_names = function(name) {
  var parts = name.split(' ');
  if (parts.length > 1) {
    parts[1] = parts.slice(1).join(' ');
  } else {
    parts.push('');
  }
  return parts;
}
