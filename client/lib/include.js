session_var_set_obj = function(key, fields, values) {
  vals = Session.get(key);
  for (var i = 0; i < fields.length; i++) {
    vals[fields[i]] = values[i];
  }
  Session.set(key, vals);
}
