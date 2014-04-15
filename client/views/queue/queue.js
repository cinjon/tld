// EVENTS
Template.queue_helper.events({
  'click .claim_episode': function(e, tmpl) {
    Meteor.call('claim_episode', this._id, Meteor.userId());
  },
  'click .unclaim_episode': function(e, tmpl) {
    Meteor.call('unclaim_episode', this._id, Meteor.userId());
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
  queue_data: function() {
    var show_ids = Episodes.find({
      postedited: false,
    }).map(function(episode) {
      return episode.show_id;
    });
    return {
      shows: _.uniq(
        Shows.find({
          _id: {
            $in: show_ids
          }
        }).map(function(show) {
          show.trial = false;
          return show;
        })
      )
    }
  }
});