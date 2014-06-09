UI.registerHelper("capitalize", function(str) {
  return capitalize(str);
});

UI.registerHelper("editor_is_current_user", function(editor_id) {
  return editor_id == Meteor.userId();
});

UI.registerHelper("episode_is_claimed", function(editor_id, episode_id) {
  return editor_id != null && editor_id != Meteor.userId();
});

UI.registerHelper("episode_is_postedited", function(episode_id) {
  return episode_is_postedited(episode_id);
});

UI.registerHelper("episode_is_unclaimed", function(editor_id) {
  return editor_id == null;
});

UI.registerHelper("format_for_videojs", function (type, format) {
  var combo = "";
  if (type == "audio" && format == "m4a") {
    combo = "audio/mp4";
  } else {
    combo = type + "/" + format;
  }
  return combo
});

UI.registerHelper("format_payment_amount", function(seconds) {
  return format_payment_amount(seconds);
});

UI.registerHelper("format_seconds_to_clock", function(seconds) {
  //assumes seconds >= 0, formats into 01:12:42 format
  return format_seconds_to_clock(seconds);
});

UI.registerHelper("is_editor_mode", function(key) {
  return is_editor_mode(key);
});

UI.registerHelper("is_regular_user", function() {
  return Meteor.userId() && !Roles.userIsInRole(Meteor.userId(), ['admin', 'editor']);
});

UI.registerHelper("layout_title", function() {
  return "Timelined";
});

UI.registerHelper("obj_number_of", function(key) {
  if (this && this[key]) {
    return this[key].length;
  }
  return "<error>"
});

UI.registerHelper("prettify_date", function(date) {
  return new Date(date).toDateString('yyyy-MM-dd')
});

UI.registerHelper("s3", function(storage_key, format, type, url) {
  //url is episode.feed.url
  if (url && format == 'youtube') {
    return url;
  } else if (storage_key && type && format) {
    if (Meteor.settings && Meteor.settings.public && Meteor.settings.public.stage_mode == true) {
      return "http://s3.amazonaws.com/timelined-staging/" + type + "/" + storage_key + "." + format;
    } else {
      return "http://s3.amazonaws.com/timelined/" + type + "/" + storage_key + "." + format;
    }
  } else {
    return null;
  }
});

UI.registerHelper("text_limit", function(text, length) {
  return text_limit(text, length);
});

UI.registerHelper("text_limit_url", function(text, length) {
  //strip away superfluous url parts, then do the text limit
  text = safe_split(text, '://', 1);
  text = safe_split(text, 'www.', 1);
  return text_limit(text, length);
});

var episode_is_postedited = function(episode_id) {
  var episode = Episodes.findOne({_id:episode_id});
  if (episode) {
    return episode.postedited
  }
  return null;
}

var _format_time_part = function(time) {
  if (time < 10) {
    return "0" + time.toString();
  } else {
    return time.toString();
  }
};

var format_payment_amount = function (seconds) {
  // payment amount = $15/hour = .004167 dollars per second
  var rate = .004167;
  var amount = (rate * seconds).toFixed(2);
  return "$" + amount.toString();
}

format_seconds_to_clock = function(seconds) {
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

var safe_split = function(text, str, num) {
  var parts = text.split(str);
  if (parts.length > num) {
    return parts[num];
  }
  return text;
}
