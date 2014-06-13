amazon_url_scrub = function (url) {
  var affiliate_id = "timelined-20";
  var asin;
  asin = url.match("/([a-zA-Z0-9]{10})(?:[/?]|$)");
  if (asin) {
    url = "http://www.amazon.com/dp" + asin[0] + "?tag=" + affiliate_id;
  }
  return url;
};

array_diff = function(A, B) {
  //array diff of A - B
  var B_ids = {}
  B.forEach(function(obj){
    B_ids[obj] = 1;
  });
  return A.filter(function(obj) {
    return !(obj in B_ids);
  });
}

capitalize = function(st) {
  if (!st) {
    return '';
  }
  return st.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
}

var _format_time_part = function(time) {
  if (time < 10) {
    return "0" + time.toString();
  } else {
    return time.toString();
  }
};

format_seconds_to_clock = function(seconds) {
  var hours = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds - (hours * 3600)) / 60);
  var secs = Math.floor(seconds - (hours * 3600) - (minutes * 60));

  var ret = "";
  ret += _format_time_part(hours);
  ret += ":";
  ret += _format_time_part(minutes);
  ret += ":";
  ret += _format_time_part(secs);
  return ret;
}

has_email = function(user) {
  return user && user.emails && user.emails[0] && 'address' in user.emails[0];
}

has_received_trial_email = function(user) {
  return user && user.received_trial_email;
}

highlight_url_scrub = function (url) {
  // amazon is the first url scrub but we can put more in
  if (url.match(/amazon\./i)) {
    url = amazon_url_scrub(url);
  }
  return url;
}

make_name_route = function(name, count) {
  var parts = name.split(' ')
  var copy = [];
  for (var pos in parts) {
    var part = parts[pos];
    if (part == '') {
      continue;
    } else {
      var part_split = part.split('.');
      for (var sub_pos in part_split) {
        var sub_part = part_split[sub_pos];
        copy.push(sub_part.toLowerCase());
      }
    }
  }
  if (count && count > 0) {
    copy.push(count.toString());
  }
  return copy.join('-');
}

format_clock_to_seconds = function(time_string) {
  //regex for HH:MM:SS
  var valid_time = time_string.match(/^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/);
  if (!valid_time) {
    return false;
  }

  var parts = time_string.split(':');
  if (parts.length < 3) {
    return false;
  }

  var seconds = 0;
  for (var pos in parts) {
    var part = parts[pos];
    if (part.length != 2) {
      return false;
    }
    seconds += Math.pow(60, 2 - pos)*parseInt(part);
  }
  return seconds;
}

if (Meteor.isServer) {
  wrapped_twitter_get = Async.wrap(twitter, 'get');
  // TODO: account for if this crashes due to rate limit exceeded on Twitter's end
  // TODO: account for when the twitter id is invalid
  twitter_avatar_url = function(name) {
    if (!name) {
      return;
    }
    var response = wrapped_twitter_get('users/show', {screen_name: name});
    if (response.profile_image_url) {
      return response.profile_image_url;
    } else {
      return "";
    }
  };
}
