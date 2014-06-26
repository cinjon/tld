Template.editor_account.helpers({
  claimed_episodes: function() {
    var episodes = Episodes.find({
      editor_id:Meteor.userId(), trial:false, published:false, postedited:false
    }).fetch();
    return {
      episodes: episodes,
      title: "Claimed Episodes",
      claimed: true
    }
  },
  completed_episodes: function() {
    var episodes = Episodes.find({
      editor_id:Meteor.userId(), trial:false, published:true, postedited:false
    }).fetch();
    return {
      episodes: episodes,
      title: "Completed Episodes"
    }
  },
  payments: function () {
    var payments = Payments.find({
      editor_id: Meteor.userId(), issued: true
    }).fetch();
    return {
      payments: payments,
      title: "Payments Issued"
    }
  },
  published_episodes: function() {
    var episodes = Episodes.find({
      editor_id:Meteor.userId(), trial:false, published:true, postedited:true
    }).fetch();
    return {
      episodes: episodes,
      title: "Published Episodes"
    }
  },
  username: function() {
    var user = Meteor.user();
    if (user && user.username) {
      return user.username;
    }
    return "<>"
  }
})

Template.editor_account_episodes.helpers({
  count: function() {
    return this.episodes.length;
  }
});

Template.episode_statistics.helpers({
  claimed_time_ticker: function() {
    //we limit the time that you have to complete an episode to 24 hours --> return can't be more than 24 hours.
    if (!this.claimed_at) {
      return "";
    }

    time = claimed_ticker_time_since(this.claimed_at);
    hours = time[0];
    minutes = time[1];
    if (hours > 21) {
      return (60*24 - minutes).toString() + " minutes remaining to complete.";
    } else if (hours < 6) {
      return "Claimed recently.";
    } else if (hours < 12) {
      return "Claimed more than 12 hours ago";
    } else {
      "Claimed less than a half-day ago";
    }
  },
  claimed_time_ticker_color: function() {
    if (!this.claimed_at) {
      return "";
    }

    time = claimed_ticker_time_since(this.claimed_at);
    if (time[0] > 21) {
      return "coral_text"
    } else {
      return "mint_text"
    }
  }
});

var claimed_ticker_time_since = function(claimed_at) {
  var minutes_divisor = 60 * 1000;
  var hours_divisor = 60 * minutes_divisor;

  var now = (new Date()).getTime();
  var diff = now - claimed_at;
  var hours = Math.floor(diff / hours_divisor);
  diff -= hours * hours_divisor;
  var minutes = hours * 60 + Math.floor(diff / minutes_divisor);
  return [hours, minutes]
}
