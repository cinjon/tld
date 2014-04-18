// Meteor.publish definitions

Meteor.publish('chapters_from_episode', function(route, id) {
  var episode = Episodes.findOne({show_route:route, _id:id});
  return Chapters.find({episode_id:episode._id}, {
    fields:{created_at:false, updated_at:false}
  });
});

Meteor.publish('company_names', function() {
  return Companies.find({}, {
    fields:{name:true}
  });
});

Meteor.publish('company_names_from_episode', function(route, id) {
  var episode = Episodes.findOne({show_route:route, _id:id});
  return Companies.find({sponsored_episodes:episode._id}, {fields:{name:true}});
});

Meteor.publish('editor_legal_agreement', function(user_id) {
  return Meteor.users.find({_id:user_id}, {fields:{signed_editor_legal:true}});
});

Meteor.publish('episode_from_show', function(route, id) {
  return Episodes.find({
    show_route: route,
    _id: id
  }, {
    fields:{length_in_seconds:false, created_at:false, updated_at:false}
  });
});

Meteor.publish('episodes_from_show', function (route) {
  return Episodes.find( {show_route: route} );
})

Meteor.publish('highlights_from_episode', function(route, id) {
  var episode = Episodes.findOne({show_route:route, _id:id});
  return Highlights.find({episode_id:episode._id}, {
    fields:{editor_id:false, created_at:false, updated_at:false}
  });
});

Meteor.publish('people_names', function() {
  return People.find({}, {
    fields:{first_name:true, last_name:true}
  });
});

Meteor.publish('people_from_episode', function(route, id) {
  var episode = Episodes.findOne({show_route:route, _id:id});
  return People.find({
    $or:[{hosts:episode._id}, {guests:episode._id}]
  }, {
    fields:{first_name:true, last_name:true, twitter:true,
            avatar:true, hosts:true, guests:true, confirmed:true}
  })
});

Meteor.publish('show_from_route', function(route) {
  return Shows.find({route:route});
});

Meteor.publish('shows_list', function() {
  return Shows.find();
});

Meteor.publish('shows_with_unpublished_episodes', function() {
  return Shows.find({
    _id: {
      $in: Episodes.find(
        {published: false}).map(
          function(episode) {
            return episode.show_id;
          }
        )
    }
  });
});

Meteor.publish('trial_episodes', function(user_id) {
  return Episodes.find({trial:true, editor_id:user_id});
});

Meteor.publish('trial_shows', function(user_id) {
  return Shows.find({
    _id: {
      $in: Episodes.find(
        {trial:true, editor_id:user_id}).map(
          function(episode) {
            return episode.show_id;
          }
        )
    }
  });
})

Meteor.publish('unpublished_episodes', function() {
  return Episodes.find({published: false});
});

Meteor.publish('user_roles', function(user_id) {
  return Meteor.users.find({_id:user_id}, {fields:{roles:true}});
});

Meteor.publish('usernames_and_roles', function() {
  return Meteor.users.find({}, {
    fields:{username:true, roles:true}
  });
});
