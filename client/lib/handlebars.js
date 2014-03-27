UI.registerHelper("capitalize", function(str) {
  return capitalize(str);
});

UI.registerHelper("format_seconds_to_clock", function(seconds) {
  //assumes seconds >= 0, formats into 01:12:42 format
  var hours = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds - (hours * 3600)) / 60);
  var secs = seconds - (hours * 3600) - (minutes * 60);

  var ret = "";
  ret += _format_time_part(hours);
  ret += ":";
  ret += _format_time_part(minutes);
  ret += ":";
  ret += _format_time_part(secs);
  return ret;
});

UI.registerHelper("has_role", function(roles) {
  return Roles.userIsInRole(Meteor.userId(), roles);
});

UI.registerHelper("is_claimer_user", function(uid) {
  return uid == Meteor.userId();
});

UI.registerHelper("is_claimer_unclaimed", function(uid) {
  return uid == null;
});

UI.registerHelper("is_claimed", function(uid) {
  return uid != null && uid != Meteor.userId();
});

var _format_time_part = function(time) {
  if (time < 10) {
    return "0" + time.toString();
  } else {
    return time.toString();
  }
};