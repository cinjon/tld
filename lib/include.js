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

format_clock_to_seconds = function(time_string) {
  //TODO: switch to regex
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