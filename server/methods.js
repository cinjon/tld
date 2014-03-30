Meteor.methods({
  claim_episode: function(episode_id, user_id) {
    Episodes.update({
      _id: episode_id
    }, {
      $set: {
        editor_id: user_id
      }
    });
  },
  new_highlight: function(info) {
    var timestamp = (new Date()).getTime();
    info['created_at'] = timestamp;

    var speaker_name = info['_speaker_name'];
    delete info['_speaker_name'];

    var episode_id = info['episode_id']
    var type = info['type'];
    var company_id = info['company_id'];
    var person_id = info['person_id'];
    var text = info['text'];
    var url = info['url'];

    if (speaker_name && !company_id && !person_id) { //new company
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
    } else if (type == 'link') {
      url = text;
    }

    make_highlight(
      type, info['editor_id'], episode_id, info['start_time'], text,
      person_id, company_id, url, timestamp
    );
  },
  new_host: function(name, episode_id) {
    var timestamp = (new Date()).getTime();
    var names = make_person_names(name);
    var hosts = [episode_id];

    person_id = make_person(
      names[0], names[1], null, null, null, hosts, [], timestamp
    );
    var episode = Episodes.findOne({_id:episode_id});
    if (!episode.hosts) {
      Episodes.update({_id:episode._id}, {$set:{hosts:[person_id]}});
    } else {
      Episodes.update({_id:episode._id}, {$addToSet:{hosts:person_id}});
    }
    return {'success':true, 'person_id':person_id};
  },
  new_guest: function(name, episode_id) {
    var timestamp = (new Date()).getTime();
    var names = make_person_names(name);
    var guests = [episode_id];

    person_id = make_person(
      names[0], names[1], null, null, null, [], guests, timestamp
    );
    var episode = Episodes.findOne({_id:episode_id});
    if (!episode.guests) {
      Episodes.update({_id:episode._id}, {$set:{guests:[person_id]}});
    } else {
      Episodes.update({_id:episode._id}, {$addToSet:{guests:person_id}});
    }
    return {'success':true, 'person_id':person_id};
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

var make_person_names = function(name) {
  var parts = name.split(' ');
  if (parts.length > 1) {
    parts[1] = parts.slice(1).join(' ');
  } else {
    parts.push('');
  }
  return parts;
}
