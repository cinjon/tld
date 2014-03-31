UI.registerHelper("capitalize", function(str) {
  return capitalize(str);
});

UI.registerHelper("editor_is_current_user", function(editor_id) {
  return editor_id == Meteor.userId();
});

UI.registerHelper("episode_is_claimed", function(editor_id) {
  return editor_id != null && editor_id != Meteor.userId();
});

UI.registerHelper("episode_is_unclaimed", function(editor_id) {
  return editor_id == null;
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

UI.registerHelper("s3", function(key) {
  if (key) {
    // FIXME: this should check the format field instead of using .mp3 string
    return "http://s3.amazonaws.com/timelined/audio/" + key + ".mp3";
  } else {
    return null;
  }
});

var _format_time_part = function(time) {
  if (time < 10) {
    return "0" + time.toString();
  } else {
    return time.toString();
  }
};
