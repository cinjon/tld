// Meteor.publish definitions

Meteor.publish('episode_from_show', function(slug, number) {
  return Episodes.find({
    slug: slug,
    number: number
  });
});

Meteor.publish('show_from_slug', function(slug) {
  return Shows.find({slug:slug})
});

Meteor.publish('highlights_from_episode', function(slug, number) {
  var episode = Episodes.findOne({show_slug:slug, number:number});
  return Highlights.find({episode_id:episode._id})
});

Meteor.publish('people_from_episode', function(slug, number) {
  var episode = Episodes.findOne({show_slug:slug, number:number});
  var people_ids = episode.host;
  people_ids.push.apply(people_ids, episode.guest);
  return People.find({_id:{$in:people_ids}})
});
