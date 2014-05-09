Meteor.subscribe('editor_legal_agreement', Meteor.userId());
if (Meteor.user() && !Meteor.user().signed_editor_legal) {
  Meteor.subscribe('trial_episodes', Meteor.userId());
  Meteor.subscribe('trial_shows', Meteor.userId());
}

// EVENTS
Template.queue_helper.events({
  'click .claim_episode': function(e, tmpl) {
    var user = Meteor.user();
    var episode_id = this._id;
    Meteor.call(
      'claim_episode', episode_id, user._id,
      function(error, result) {
        if (!error) {
          Meteor.call('send_slack_notification', 'robots',
                      {text:'Claimed episode: ' + user.username + ' (' + user._id + ') claimed episode ' + episode_id})
        }
      }
    );
  },
  'click .unclaim_episode': function(e, tmpl) {
    var user = Meteor.user();
    var episode_id = this._id;
    Meteor.call(
      'unclaim_episode', episode_id, user._id,
      function(error, result) {
        if (!error) {
          Meteor.call('send_slack_notification', 'robots',
                      {text:'Unclaimed episode: ' + user.username + ' (' + user._id + ') unclaimed episode ' + episode_id})
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
      show.trial = false;
      return show;
    })
  }
}
