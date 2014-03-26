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
  is_claimed: function(e, tmpl) {
    var claimer_id = this.claimer_id;
    return !client_global_unclaimed(claimer_id) && !client_global_is_claimer(claimer_id);
  },
  is_claimer: function() {
    return client_global_has_role(['admin', 'editor']) && client_global_is_claimer(this.claimer_id);
  },
  is_unclaimed: function(e, tmpl) {
    return client_global_unclaimed(this.claimer_id);
  },
  shows: function() {
    var show_ids = [];
    Episodes.find({
      edited: false
    }).forEach(function(episode) {
      show_ids.push(episode.show_id);
    });
    return Shows.find({
      _id: {
        $in: show_ids
      }
    });
  },
});