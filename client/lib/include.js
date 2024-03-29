check_password = function(password, callback) {
  /*
     For use with verifying that this is the current user taking the action
     An example is the /profile change_email action
     taken from: http://stackoverflow.com/questions/18214496/verify-user-password-in-meteor
  */
  var request, srp;
  srp = new Package.srp.SRP.Client(password);
  request = srp.startExchange();
  request.user = {
    id: Meteor.userId()
  };
  return Meteor.apply('beginPasswordExchange', [request], function(err, result) {
    var response;
    response = srp.respondToChallenge(result);
    return Meteor.apply('check_password', [response], function(err, result) {
      return callback(err, result);
    });
  });
};

session_var_increment = function(key, num) {
  //Assumes Session.get(key) is a number value
  //num can be a negative number as well
  var value = Session.get(key);
  Session.set(key, value + num);
}

session_var_set_obj = function(key, fields, values) {
  vals = Session.get(key);
  for (var i = 0; i < fields.length; i++) {
    vals[fields[i]] = values[i];
  }
  Session.set(key, vals);
}

session_var_splice = function(session_key, value) {
  var vals = Session.get(session_key);
  var index = vals.indexOf(value);
  if (index > -1) {
    vals.splice(index, 1);
    Session.set(session_key, vals);
  }
};

session_var_push = function(session_key, value) {
  var vals = Session.get(session_key);
  if (!vals) {
    Session.set(session_key, [value]);
  } else {
    var index = vals.indexOf(value);
    if (index == -1) {
      vals.push(value);
      Session.set(session_key, vals);
    }
  }
}

text_limit = function(text, length) {
  if (!text) {
    return '';
  } else if (text.length <= length) {
    return text;
  } else {
    return text.slice(0, length-3) + '...';
  }
}