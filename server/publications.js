// Meteor.publish definitions

Meteor.publish('episode_from_show', function(route, number) {
  return Episodes.find({
    route: route,
    number: number
  });
});

Meteor.publish('show_from_route', function(route) {
  return Shows.find({route:route})
});

Meteor.publish('highlights_from_episode', function(route, number) {
  var episode = Episodes.findOne({show_route:route, number:number});
  return Highlights.find({episode_id:episode._id})
});

Meteor.publish('people_from_episode', function(route, number) {
  var episode = Episodes.findOne({show_route:route, number:number});
  var people_ids = episode.host;
  people_ids.push.apply(people_ids, episode.guest);
  return People.find({_id:{$in:people_ids}})
});
