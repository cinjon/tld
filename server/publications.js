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
  var people_ids = episode.hosts;
  people_ids.push.apply(people_ids, episode.guests);
  return People.find({_id:{$in:people_ids}})
});

Meteor.publish('shows_with_unedited_episodes', function() {
  return Shows.find({
    _id: {
      $in: Episodes.find(
        {edited: false}).map(
          function(episode) {
            return episode.show_id;
          }
        )
    }
  });
});

Meteor.publish('unedited_episodes', function() {
  return Episodes.find({edited: false});
});
