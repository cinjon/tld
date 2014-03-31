// Meteor.method definitions

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

  new_highlight: function(info, route, number) {
    var timestamp = (new Date()).getTime();
    info['created_at'] = timestamp;
    var episode = Episodes.findOne({show_route:route, number:number}, {fields:{_id:true}});
    info['episode_id'] = episode._id;
    var speaker_name = info['_speaker_name'];
    delete info['_speaker_name'];
    var type = info['type'];
    var company_id = info['company_id'];
    var person_id = info['person_id'];
    var text = info['text'];
    var url = info['url'];
    if (speaker_name && !company_id && !person_id) {
      if (type == 'sponsor') {
        company_id = make_company(
          speaker_name, null, null, timestamp, [episode._id]
        );
      } else if (type == 'person') {
        parts = speaker_name.split(' ');
        if (parts.length > 1) {
          parts[1] = parts.slice(1).join(' ');
        } else {
          parts.push('');
        }
        person_id = make_person(
          parts[0], parts[1], null, null, null, [], [], timestamp
        );

        if (text.slice(0,1) == '"') {
          type = 'quote';
          var start_slice = 1;
          var end_slice = text.length;
          if (text.slice(-1) == '"') {
            end_slice -= 1;
          }
          text = text.slice(start_slice, end_slice);
        } else {
          type = 'note';
        }
      } else if (type == 'link') {
        url = text;
      }
    }
    make_highlight(
      type, info['editor_id'], episode._id, info['start_time'], text,
      person_id, company_id, url, timestamp
    );
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
