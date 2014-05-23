// EVENTS
Template.queue_helper.events({
  'click .claim_episode': function(e, tmpl) {
    var user = Meteor.user();
    var episode= Episodes.findOne({_id:this._id});
    Meteor.call(
      'claim_episode', episode._id, user._id,
      function(error, result) {
        if (!error) {
          Meteor.call('send_slack_notification', 'editors',
                      {text:'Claimed: ' + user.username + ' is working on ' + episode.route})
        }
      }
    );
  },
  'click .unclaim_episode': function(e, tmpl) {
    var user = Meteor.user();
    var episode = Episodes.findOne({_id:this._id});
    Meteor.call(
      'unclaim_episode', episode._id, user._id,
      function(error, result) {
        if (!error) {
          Meteor.call('send_slack_notification', 'editors',
                      {text:'Unclaimed: ' + user.username + ' is done with ' + episode.route})
        }
      }
    )
  },
});

// HELPERS
Template.queue_helper.helpers({
  episodes: function() {
    var show_name = this.name;
    var show_id = this._id;
    if (this.trial) {
      var episodes = Episodes.find({
        show_id: show_id,
        trial: true,
        editor_id: Meteor.userId()
      })
    } else {
      var episodes = Episodes.find({
        show_id: show_id,
        trial: false
      });
    }
    return episodes.map(function(episode) {
      episode.show_name = show_name;
      return episode;
    });
  },
  published: function() {
    return this.feed.published;
  },
});

Template.queue.helpers({
  editor_queue_data: function() {
    return _queue_data({published:false, trial:false})
  },
  trial_queue_data: function() {
    return _queue_data({trial:true, editor_id:Meteor.userId()})
  }
});

var _queue_data = function(criteria) {
  return {
    shows: Shows.find({
      _id: {
        $in: Episodes.find(
          criteria, {
          fields:{show_id:true}
          }
        ).map(
          function(episode) {
            return episode.show_id;
          }
        )
      }
    }).map(function(show) {
      show.trial = criteria['trial']
      return show;
    })
  }
}
