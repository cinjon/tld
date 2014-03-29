// Meteor.publish definitions

Meteor.publish('company_names', function() {
  return Companies.find({}, {
    fields:{name:true}
  });
});

Meteor.publish('episode_from_show', function(route, number) {
  return Episodes.find({
    show_route: route,
    number: number
  });
});

Meteor.publish('highlights_from_episode', function(route, number) {
  var episode = Episodes.findOne({show_route:route, number:number});
  return Highlights.find({episode_id:episode._id});
});

Meteor.publish('people_names', function() {
  return People.find({}, {
    fields:{first_name:true, last_name:true}
  });
});

Meteor.publish('people_from_episode', function(route, number) {
  var episode = Episodes.findOne({show_route:route, number:number});
  var people = episode.hosts || [];
  var guests = episode.guests || [];
  people.push.apply(people, guests);
  return People.find({_id:{$in:people}});
});

Meteor.publish('show_from_route', function(route) {
  return Shows.find({route:route})
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