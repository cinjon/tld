// EVENTS

Template.claimed_or_unclaimed.events({
  'click .claim_episode': function(e, tmpl) {
    Meteor.call('claim_episode', this._id, Meteor.userId());
  },
  'click .unclaim_episode': function(e, tmpl) {
    Meteor.call('unclaim_episode', this._id, Meteor.userId());
  },
});

// HELPERS

Template.queue.helpers({
  episodes: function() {
    var show_name = this.name;
    return Episodes.find({
      show_id: this._id
    }).map(function(episode) {
      episode.show_name = show_name;
      return episode;
    });
  },
  published: function() {
    return this.feed.published;
  },
  shows: function() {
    var show_ids = [];
    Episodes.find({
      postedited: false
    }).forEach( function(episode) {
      show_ids.push(episode.show_id);
    });
    return Shows.find({
      _id: {
        $in: show_ids
      }
    });
  },
});
