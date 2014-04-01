UI.registerHelper("capitalize", function(str) {
  return capitalize(str);
});

UI.registerHelper("format_seconds_to_clock", function(seconds) {
  //assumes seconds >= 0, formats into 01:12:42 format
  return format_seconds_to_clock(seconds);
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

UI.registerHelper("s3", function(key) {
  if (key) {
    return "http://s3.amazonaws.com/timelined/audio/" + key + ".mp3";
  } else {
    return null;
  }
});

UI.registerHelper("text_limit", function(text, length) {
  if (text.length <= length) {
    return text;
  } else {
    return text.slice(0, length-3) + '...';
  }
});

var _format_time_part = function(time) {
  if (time < 10) {
    return "0" + time.toString();
  } else {
    return time.toString();
  }
};

var format_seconds_to_clock = function(seconds) {
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
}