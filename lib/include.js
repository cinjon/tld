capitalize = function(st) {
  if (!st) {
    return '';
  }
  return st.charAt(0).toUpperCase() + st.slice(1);
}

make_name_route = function(name) {
  var count = Shows.find({name:name}).count();
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
  if (count > 0) {
    copy.push(count.toString());
  }
  return copy.join('-');
}