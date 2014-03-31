// EVENTS

Template.queue.events({
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
    return Episodes.find({
      show_id: this._id
    });
  },
  shows: function() {
    var show_ids = [];
    Episodes.find({
      edited: false
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
