Meteor.methods({
  add_user_email: function(user_id, email) {
    var user = Meteor.users.findOne({_id:user_id});
    if (!user) {
      return;
    }

    if (!validate_email_for_parts(email)) {
      return 'validation';
    }

    var emails = user.emails || [];
    var email = {"address":email, "verified":false};

    //If the user already used this email, use it again rather than making another of the same
    var user_has_email = false;
    for (index in emails) {
      if (emails[index]['address'] == email['address']) {
        email = emails[index];
        user_has_email = true;
        break;
      }
    }
    if (user_has_email) {
      emails.splice(index, 1);
    }

    emails.unshift(email);
    try {
      Meteor.users.update({_id:user_id}, {$set:{emails:emails}});
      if (Meteor.isServer && !email['verified']) {
        Accounts.sendVerificationEmail(user_id, email['address']);
      }
    }
    catch(err) {
      return 'exists';
    }
  },
  add_first_chapter: function(episode_id) {
    var chapter_id = make_chapter(
      'Introduction', true, episode_id, null, 0, [], null);
    Episodes.update({_id:episode_id}, {$addToSet:{chapters:chapter_id}});
  },
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
    var editor_id = info['editor_id'];

    if (speaker_name && !company_id && !person_id && !(type=='link')) { //new company
      company_id = make_company(
        speaker_name, null, null, [episode_id]
      );
    }

    if (type == 'quote') {
      text = text.trim();
      if (text.slice(0,1) != '"') {
        text = '"' + text;
      }
      if (text.slice(-1) != '"') {
        text = text + '"';
      }
    }

    var highlight_id = make_highlight(
      type, editor_id, episode_id, null,
      start_time, text, person_id, company_id, null
    );

    add_highlight_to_chapter(highlight_id, episode_id, start_time);
    Episodes.update({_id:episode_id}, {$addToSet:{highlights:highlight_id}});
  },
  add_host: function(episode_id, person_id) {
    Episodes.update({_id:episode_id}, {$addToSet:{hosts:person_id}});
    People.update({_id:person_id}, {$addToSet:{hosts:episode_id}});
  },
  add_sponsor: function(episode_id, company_id) {
    Episodes.update({_id:episode_id}, {$addToSet:{sponsors:company_id}});
    Companies.update({_id:company_id}, {$addToSet:{sponsored_episodes:episode_id}});
  },
  claim_episode: function(episode_id, user_id) {
    //Prevents users from toggling the claim button to reset the clock
    //Doesn't go back more than one, so if you were the editor two claims ago,
    //You start over with a fresh clock

    //Checks first to see if the editor has two episodes already claimed and not postedited true
    if (Episodes.find({editor_id:user_id, postedited:false, trial:false}).count() >= 2) {
      return false;
    }

    var episode = Episodes.findOne({_id:episode_id});
    if (episode && episode.claimed_previously_by && episode.claimed_previously_by == user_id) {
      Episodes.update({_id:episode_id}, {
        $set: {editor_id:user_id}
      });
      return true;
    } else if (episode) {
      Episodes.update({_id:episode_id}, {
        $set: {
          editor_id: user_id,
          claimed_at: new Date()
        }
      });
      return true;
    }
  },
  delete_company: function(company_id) {
    Companies.remove({_id:company_id});
  },
  delete_person: function(person_id) {
    People.remove({_id:person_id});
  },
  merge_companies: function(merge_this_company_id, into_that_company_id) {
    var this_company = Companies.findOne({_id:merge_this_company_id});
    var that_company = Companies.findOne({_id:into_that_company_id});
    if (!this_company || !that_company) {
      return;
    }

    var twitter = that_company.twitter || this_company.twitter;
    var homepage = that_company.homepage || this_company.homepage;
    var avatar = that_company.avatar || this_company.avatar;

    // Set vars of this company and add them as sponsor
    Companies.update({_id:into_that_company_id}, {
      $set:{twitter:twitter, avatar:avatar, homepage:homepage},
      $addToSet:{
        sponsored_episodes:{$each:this_company.sponsored_episodes}
      }
    });

    // Change highlights to have this company
    Highlights.update({company_id:merge_this_company_id}, {
      $set:{company_id:into_that_company_id}
    }, {
      multi:true
    });

    // Change corresponding episodes to have this company as sponsor
    Episodes.update({sponsors:merge_this_company_id}, {
      $addToSet:{sponsors:into_that_company_id}
    }, {
      multi:true
    });

    // Change corresponding episodes to no longer have the former company as sponsor
    Episodes.update({sponsors:merge_this_company_id}, {
      $pull:{sponsors:merge_this_company_id}
    }, {
      multi:true
    });

    // Remove merged company
    Companies.remove({_id:merge_this_company_id});

    return {'success':true}
  },
  merge_people: function(merge_this_person_id, into_that_person_id) {
    var this_person = People.findOne({_id:merge_this_person_id});
    var that_person = People.findOne({_id:into_that_person_id});
    if (!this_person || !that_person) {
      return;
    }

    var confirmed = that_person.confirmed || this_person.confirmed;
    var twitter = that_person.twitter || this_person.twitter;
    var homepage = that_person.homepage || this_person.homepage;
    var avatar = that_person.avatar || this_person.avatar;

    // Set vars of this person and add them as guests and hosts
    People.update({_id:into_that_person_id}, {
      $set:{twitter:twitter, avatar:avatar, homepage:homepage, confirmed:confirmed},
      $addToSet:{
        hosts:{$each:this_person.hosts}, guests:{$each:this_person.guests}
      }
    });

    // Change highlights to have this person speaking
    Highlights.update({person_id:merge_this_person_id}, {
      $set:{person_id:into_that_person_id}
    }, {
      multi:true
    });

    // Change corresponding episodes to have this person as host
    Episodes.update({hosts:merge_this_person_id}, {
      $addToSet:{hosts:into_that_person_id}
    }, {
      multi:true
    });

    // Change corresponding episodes to no longer have the former person as host
    Episodes.update({hosts:merge_this_person_id}, {
      $pull:{hosts:merge_this_person_id}
    }, {
      multi:true
    });

    // Change corresponding episodes to have this person as guest
    Episodes.update({guests:merge_this_person_id}, {
      $addToSet:{guests:into_that_person_id}
    }, {
      multi:true
    });

    // Change corresponding episodes to no longer have the former person as guest
    Episodes.update({guests:merge_this_person_id}, {
      $pull:{guests:merge_this_person_id}
    }, {
      multi:true
    });

    // Remove merged person
    People.remove({_id:merge_this_person_id});

    return {'success':true}
  },
  new_chapter: function(previous_chapter_id, previous_highlight_start_time, editor_id) {
    editor_id = editor_id
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
      null, false, chapter.episode_id, editor_id, start_time,
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
  new_guest: function(name, episode_id) {
    var names = make_person_names(name);
    var guests = [episode_id];

    person_id = make_person(
      names[0], names[1], null, null, [], guests, false
    );
    Episodes.update({_id:episode_id}, {$addToSet:{guests:person_id}});
  },
  new_host: function(name, episode_id) {
    var names = make_person_names(name);
    var hosts = [episode_id];
    person_id = make_person(
      names[0], names[1], null, null, hosts, [], false
    );
    Episodes.update({_id:episode_id}, {$addToSet:{hosts:person_id}});
  },
  new_sponsor: function(name, episode_id) {
    var company_id = make_company(
      name, null, null, [episode_id]
    );
    Episodes.update({_id:episode_id}, {$addToSet:{sponsors:company_id}});
  },
  remove_chapter: function(chapter_id) {
    remove_chapter(Chapters.findOne({_id:chapter_id}));
  },
  remove_guest: function(episode_id, person_id) {
    if (Highlights.find({episode_id:episode_id, person_id:person_id}).count() > 0) {
      return {'success':false};
    } else {
      Episodes.update({_id:episode_id}, {$pull:{guests:person_id}});
      People.update({_id:person_id}, {$pull:{guests:episode_id}});
      return {'success':true};
    }
  },
  remove_highlight: function(highlight_id) {
    var highlight = Highlights.findOne({_id:highlight_id});
    Highlights.remove({_id:highlight_id});
    var chapter_id = highlight.chapter_id;
    var chapter = Chapters.findOne({_id:chapter_id});

    Chapters.update({_id:chapter_id}, {$pull:{highlights:highlight_id}});
    if (chapter.highlights.length == 1) { //no highlight left in chapter (but already removed it in the line above)
      chapter.highlights = [];
      remove_chapter(chapter); //Won't remove the first chapter
    } else if (!chapter.first && chapter.start_time >= highlight.start_time) {
      var start_time = chapter.start_time;
      Highlights.find({chapter_id:chapter_id}, {start_time:true, sort:{start_time:1}, limit:1}).forEach(function(highlight) {
        start_time = highlight.start_time;
      });
      Chapters.update({_id:chapter_id}, {$set:{start_time:start_time}});
    }
    Episodes.update({_id:chapter.episode_id}, {$pull:{highlights:highlight_id}});
  },
  remove_host: function(episode_id, person_id) {
    if (Highlights.find({episode_id:episode_id, person_id:person_id}).count() > 0) {
      return {'success':false};
    } else {
      Episodes.update({_id:episode_id}, {$pull:{hosts:person_id}});
      People.update({_id:person_id}, {$pull:{hosts:episode_id}});
      return {'success':true};
    }
  },
  remove_sponsor: function(episode_id, company_id) {
    if (Highlights.find({episode_id:episode_id, company_id:company_id}).count() > 0) {
      return {'success':false};
    } else {
      Companies.update({_id:company_id}, {$pull:{sponsored_episodes:episode_id}});
      Episodes.update({_id:episode_id}, {$pull:{sponsors:company_id}});
      return {'success':true};
    }
  },
  set_bookmark: function(user_id, highlight_id) {
    var bookmark = Bookmarks.findOne({user_id:user_id, highlight_id:highlight_id});
    if (!bookmark) {
      make_bookmark(user_id, highlight_id);
    } else {
      Bookmarks.update({_id:bookmark._id}, {$set:{deleted:!bookmark.deleted}});
    }
  },
  set_agree_to_terms: function(user_id, was_agreed) {
    Meteor.users.update({_id:user_id}, {$set:{signed_editor_legal:!was_agreed}});
  },
  set_alpha: function(user_id, is_alpha) {
    set_roles(user_id, is_alpha, ['alpha']);
  },
  set_chapter_title: function(chapter_id, title) {
    Chapters.update({_id:chapter_id}, {$set:{title:title}});
  },
  set_completed_trial: function(user_id, completed_trial) {
    Meteor.users.update({_id:user_id}, {$set:{completed_trial:completed_trial}});
  },
  set_editor: function(user_id, is_editor) {
    set_roles(user_id, is_editor, ['editor']);
    var user = Meteor.users.findOne(user_id);

    if (!is_editor && user && user.emails && user.emails[0]) {
      Meteor.call('send_email', {
        to: user.emails[0].address,
        from: 'Timelined Support <support@timelined.com>',
        subject: "Timelined wants you as an Editor, " + user.username,
        text: "",
        html: "<p>Excellent work on your trial episode. We'd like for you to start on new episodes and... GET PAID! \
      Before you can start, we'll need you to sign the <a href='https://www.hellosign.com/s/334cd7d0'>Timelined Editor Agreement</a>, \
      which includes both our contract and required tax information.</p>\
      <p>A few things to remember before starting: \
      <ul><li>Payment is issued after 20 hours of published content</li>\
      <li>Once you claim an episode, you have 36 hours to complete it</li>\
      <li>Review the <a href='http://timelined.com/guidelines'>Editor Guidelines</a></li>\
      <li>Watch the <a href='https://vimeo.com/97655214'>Editor screencast</a></li>\
      <li>Contact us anytime with questions of feedback</li></ul></p>\
      <p>Happy Timelining!</p><br>Sincerely,<br>The Timelined Team<br>support@timelined.com"
    });
    }
  },
  set_episode_summary: function(episode_id, summary) {
    Episodes.update({_id:episode_id}, {$set:{summary:summary}});
  },
  set_episode_title: function(episode_id, title) {
    Episodes.update({_id:episode_id}, {$set:{title:title}});
  },
  set_highlight_text: function(highlight_id, text) {
    Highlights.update({_id:highlight_id}, {$set:{text:text}});
  },
  set_highlight_type: function(highlight_id, type) {
    Highlights.update({_id:highlight_id}, {$set:{type:type}});
  },
  set_highlight_url: function(highlight_id, url) {
    var valid_url = url_regex.test(url);
    if (valid_url) {
      Highlights.update({_id:highlight_id}, {$set:{url:url}});
    } else {
      console.log("Invalid URL.");
      return false;
    }
  },
  set_name_company: function(company_id, name) {
    Companies.update({_id:company_id}, {$set:{name:name}});
  },
  set_name_person: function(person_id, name) {
    var parts = name.split(' ');
    if (parts.length != 2) {
      return;
    }
    People.update({_id:person_id}, {$set:{first_name:parts[0], last_name:parts[1]}});
  },
  set_postedited_true: function(episode_id) {
    Episodes.update({_id:episode_id}, {$set:{postedited:true}});
    return {'success':'true'}
  },
  set_published_episode: function(episode_id, published) {
    Episodes.update({_id:episode_id}, {$set:{published:published}});
  },
  set_twitter_company: function(company_id, twitter) {
    if (twitter == '') {
      return;
    }
    Companies.update({_id:company_id}, {$set:{twitter:twitter}});
  },
  set_twitter_person: function(person_id, twitter) {
    if (twitter == '') {
      return;
    }
    People.update({_id:person_id}, {$set:{twitter:twitter}});
  },
  set_start_time: function(highlight_id, seconds) {
    var highlight = Highlights.findOne({_id:highlight_id}, {fields:{episode_id:true}});
    Highlights.update({_id:highlight_id}, {$set:{start_time:seconds}});
    add_highlight_to_chapter(highlight_id, highlight.episode_id, seconds);
  },
  unclaim_episode: function(episode_id, user_id) {
    Episodes.update({_id: episode_id}, {
      $set: {
        editor_id: null,
        claimed_previously_by: user_id
      }
    });
  },
  update_user: function (doc) {
      user = Meteor.users.findOne(doc._id);
      if (user) {
        // remove _id so object can update
        delete doc._id;
        // leaving this here for now, but it throws an error everytime
        // check(doc, userSchema);
        userSchema.clean(doc);
        Meteor.users.update({_id:user._id}, {$set:doc});
      }
  }
});

var add_highlight_to_chapter = function(highlight_id, episode_id, start_time) {
  var chapter = null;
  var chapters = Chapters.find({episode_id:episode_id}, {sort:{start_time:1}}).fetch();
  for (var index = 0; index < chapters.length; index++) {
    var chapter = chapters[index];
    if (chapter.next_chapter_id == null || index == chapters.length - 1 ||
        (chapter.start_time <= start_time && start_time < chapters[index+1].start_time)) {
      //first two clauses should be the same, but second one serves as a safety just in case
      break;
    }
  }

  if (!chapter) {
    return;
  }

  Highlights.update({_id:highlight_id}, {$set:{chapter_id:chapter._id}});
  Chapters.update({highlights:highlight_id}, {$pull:{highlights:highlight_id}});
  if (!chapter.first && (!chapter.start_time || chapter.start_time > start_time)) {
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

var remove_chapter = function(chapter) {
  if (chapter.first) {
    return;
  }

  var chapter_id = chapter._id;
  var previous_chapter = Chapters.findOne({
    episode_id:chapter.episode_id, next_chapter_id:chapter_id});
  var highlights = chapter.highlights;
  Chapters.update({_id:previous_chapter._id}, {
    $pushAll:{highlights:highlights},
    $set:{next_chapter_id:chapter.next_chapter_id}
  });
  Highlights.update({_id:{$in:highlights}}, {$set:{chapter_id:previous_chapter._id}}, {multi:true});
  Episodes.update({_id:previous_chapter.episode_id}, {$pull:{chapters:chapter_id}});
  Chapters.remove({_id:chapter_id});
}

var set_roles = function(user_id, remove, roles) {
  //remove is true if we are removing user from roles.
  if (remove) {
    Roles.removeUsersFromRoles(user_id, roles);
  } else {
    Roles.addUsersToRoles(user_id, roles);
  }
}

var validate_email_for_parts = function(email) {
  //Some quick validation
  var parts = email.split('@');
  if (parts.length != 2 || parts[0] == '' || parts[1] == '') {
    return false;
  }
  return true;
}
