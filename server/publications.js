// Meteor.publish definitions

Meteor.publish('bookmarks_from_episode_route_and_user_id', function(episode_route, user_id) {
  var episode = Episodes.findOne({route:episode_route});
  if (!episode) {
    return [];
  }
  return Bookmarks.find({highlight_id:{$in:episode.highlights}, user_id:user_id});
});

Meteor.publish('chapters_from_episode', function(episode_id) {
  return Chapters.find({episode_id:episode_id}, {
    fields:{created_at:false, updated_at:false}
  });
});

Meteor.publish('chapters_from_episode_route', function(episode_route) {
  var episode = Episodes.findOne({route:episode_route});
  if (!episode) {
    return [];
  }
  return Chapters.find({episode_id:episode._id}, {
    fields:{created_at:false, updated_at:false}
  });
});

Meteor.publish('companies_from_episode', function(episode_id) {
  return Companies.find({sponsored_episodes:episode_id}, {
    fields:{name:true, twitter:true, avatar:true, sponsored_episodes:true, confirmed:true}
  });
});

Meteor.publish('companies_from_episode_route', function(episode_route) {
  var episode = Episodes.findOne({route:episode_route});
  if (!episode) {
    return [];
  }
  return Companies.find({sponsored_episodes:episode._id}, {
    fields:{name:true, twitter:true, avatar:true, sponsored_episodes:true, confirmed:true}
  });
});

Meteor.publish('companies_list', function () {
  return Companies.find();
})

Meteor.publish('company_from_id', function (id) {
  return Companies.find({_id: id});
})

Meteor.publish('company_names', function() {
  return Companies.find({}, {
    fields:{name:true}
  });
});

Meteor.publish('company_names_from_episode', function(episode_id) {
  return Companies.find({sponsored_episodes:episode_id}, {fields:{name:true}});
});

Meteor.publish('company_names_from_episode_route', function(episode_route) {
  var episode_id = Episodes.findOne({route:episode_route})._id;
  return Companies.find({sponsored_episodes:episode_id}, {fields:{name:true}});
});

Meteor.publish('editor_completed_trial', function(user_id) {
  return Meteor.users.find({_id:user_id}, {fields:{completed_trial:true}});
});

Meteor.publish('editor_legal_agreement', function(user_id) {
  return Meteor.users.find({_id:user_id}, {fields:{signed_editor_legal:true}});
});

Meteor.publish('episode_from_id', function(episode_id) {
  return Episodes.find({_id:episode_id}, {
    fields:{created_at:false, updated_at:false}
  });
});

Meteor.publish('episode_from_route', function(episode_route) {
  return Episodes.find({route: episode_route}, {
    fields:{created_at:false, updated_at:false}
  });
});

Meteor.publish('episodes_by_editor', function(user_id) {
  return Episodes.find({editor_id:user_id, trial:false}, {
    fields: {
      title:true, show_route:true, hosts:true, guests:true,
      chapters:true, highlights:true, postedited:true, length_in_seconds:true,
      updated_at:true, published:true, trial:true, editor_id:true, claimed_at:true
    }
  });
});

Meteor.publish('episodes_from_show', function (route) {
  return Episodes.find({show_route: route});
})

Meteor.publish('highlights_from_episode', function(episode_id) {
  return Highlights.find({episode_id:episode_id}, {
    fields:{editor_id:false, created_at:false, updated_at:false}
  });
});

Meteor.publish('highlights_from_episode_route', function(episode_route) {
  var episode = Episodes.findOne({route:episode_route});
  if (!episode) {
    return [];
  }
  return Highlights.find({episode_id:episode._id}, {
    fields:{editor_id:false, created_at:false, updated_at:false}
  });
});

Meteor.publish('people_list', function () {
  return People.find();
});

Meteor.publish('people_names', function() {
  return People.find({}, {
    fields:{first_name:true, last_name:true}
  });
});

Meteor.publish('people_from_episode', function(episode_id) {
  return People.find({
    $or:[{hosts:episode_id}, {guests:episode_id}]
  }, {
    fields:{first_name:true, last_name:true, twitter:true,
            avatar:true, hosts:true, guests:true, confirmed:true}
  })
});

Meteor.publish('people_from_episode_route', function(episode_route) {
  var episode = Episodes.findOne({route:episode_route});
  if (!episode) {
    return null;
  }
  var episode_id = episode._id;
  return People.find({
    $or:[{hosts:episode_id}, {guests:episode_id}]
  }, {
    fields:{first_name:true, last_name:true, twitter:true,
            avatar:true, hosts:true, guests:true, confirmed:true}
  })
});

Meteor.publish('person_from_id', function (id) {
  return People.find({_id: id});
})

Meteor.publish('published_episodes', function() {
  return Episodes.find({published:true, trial:false});
});

Meteor.publish('show_from_route', function(route) {
  return Shows.find({route:route});
});

Meteor.publish('shows_list', function() {
  return Shows.find();
});

Meteor.publish('shows_with_published_episodes', function() {
  return Shows.find({
    _id: {
      $in: Episodes.find(
        {published: true, trial:false}).map(
          function(episode) {
            return episode.show_id;
          }
        )
    }
  });
});

Meteor.publish('shows_with_unpublished_episodes', function() {
  return Shows.find({
    _id: {
      $in: Episodes.find(
        {published: false, hidden: false, trial: false}).map(
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
        {trial:true, editor_id:user_id}, {fields:{show_id:true}}).map(
          function(episode) {
            return episode.show_id;
          }
        )
    }
  });
});

Meteor.publish('unpublished_episodes', function() {
  return Episodes.find({
    published: false,
    hidden: false,
    trial: false
  }, {
    sort: {"feed.published": -1}
  });
});

Meteor.publish('users_list', function () {
  return Meteor.users.find();
});

Meteor.publish('user_from_id', function (user_id) {
  return Meteor.users.find({_id: user_id});
});

Meteor.publish('user_roles', function(user_id) {
  return Meteor.users.find({_id:user_id}, {fields:{roles:true}});
});

Meteor.publish('usernames_and_roles', function() {
  return Meteor.users.find({}, {
    fields:{username:true, roles:true, completed_trial:true, signed_editor_legal:true}
  });
});
