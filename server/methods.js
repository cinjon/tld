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

    delete info['_speaker_name']
    console.log(info);
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