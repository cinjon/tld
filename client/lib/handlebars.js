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
  return format_seconds_to_clock(seconds);
});

UI.registerHelper("has_role", function(roles) {
  //TODO: change to the helper in Roles that does this.
  return Roles.userIsInRole(Meteor.userId(), roles);
});

UI.registerHelper("is_editor_mode", function(key) {
  return is_editor_mode(key);
});

UI.registerHelper("s3", function(storage_key, format) {
  if (storage_key && format) {
    return "http://s3.amazonaws.com/timelined/audio/" + storage_key + "." + format;
  } else {
    return null;
  }
});

UI.registerHelper("text_limit", function(text, length) {
  if (!text) {
    return '';
  } else if (text.length <= length) {
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

is_editor_mode = function(mode) {
  return Session.get('editor_mode') == mode;
}
