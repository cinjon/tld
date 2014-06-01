// Iron-router routes

var SHOW_HOME = false;
var sign_in = 'entrySignIn';
var on_boarding = 'on_boarding';

var ir_before_hooks = {
  is_admin: function(pause) {
    role_check('admin', sign_in, pause);
  },
  is_editor: function(pause) {
    var redirect = sign_in;
    if (Meteor.userId()) {
      redirect = on_boarding;
    }
    role_check(['editor'], redirect, pause);
  },
  is_signed_in: function(pause) {
    if (!Meteor.userId()) {
      var redirected = role_check('trial_editor', 'on_boarding', pause);
      if (!redirected) {
        redirected = role_check('editor', 'queue', pause);
      }
    }
  },
  redirect_to_sign_in: function(pause) {
    if (!(Meteor.user() || Meteor.loggingIn())) {
      go_to(sign_in, pause);
    }
  },
};

var go_to = function(redirect, pause) {
  Router.go(redirect);
  if (pause) {
    pause();
  }
};

var role_check_or = function(roles, redirect, pause) {
  redirect = redirect || 'on_boarding';
  if (Meteor.subscribe('user_roles', Meteor.userId()).ready()) {
    var is_in_a_role = false;
    for (var role in roles) {
      if (Roles.userIsInRole(Meteor.userId(), roles[role])) {
        is_in_a_role = true;
        break;
      }
    }
    if (!is_in_a_role) {
      go_to(redirect, pause);
      return true;
    }
  }
}

var role_check = function(role, redirect, pause) {
  redirect = redirect || 'on_boarding';
  if (Meteor.subscribe('user_roles', Meteor.userId()).ready() && !Roles.userIsInRole(Meteor.userId(), role)) {
    go_to(redirect, pause);
    return true;
  }
};

Router.onBeforeAction(ir_before_hooks.redirect_to_sign_in, {only:['admin', 'editor', 'queue', 'on_boarding']});
Router.onBeforeAction(ir_before_hooks.is_editor, {only:['editor_account']});
Router.onBeforeAction(ir_before_hooks.is_signed_in, {only:['tlEntrySignIn', 'tlEntrySignUp']});
Router.onBeforeAction(ir_before_hooks.is_admin, {
  only:[
    'admin', 'preview',
    'companies_edit', 'companies_list', 'companies_new',
    'episodes_edit', 'episodes_list', 'episodes_new',
    'people_edit', 'people_list', 'people_new',
    'shows_edit', 'shows_list', 'show_new',
    'users_edit', 'users_list',
  ]
});

Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: '404'
});

Router.map( function() {
  this.route('about', {
    path: '/about'
  });

  this.route('admin', {
    path: '/admin'
  });

  this.route('companies_edit',{
    path: '/companies/:id/edit',
    waitOn: function () {
      return Meteor.subscribe( 'company_from_id', this.params.id);
    },
    data: function () {
      return Companies.findOne({ _id: this.params.id});
    }
  });

  this.route('companies_list',{
    path: '/companies',
    waitOn: function () {
      return Meteor.subscribe('companies_list');
    },
    data: function () {
      return { companies: Companies.find() };
    }
  });

  this.route('companies_new',{
    path: '/companies/new',
  });

  this.route('contact', {
    path: '/contact'
  });

  this.route('editor', {
    path: '/editor/:show_route/:episode_route',
    onBeforeAction: function(pause) {
      var episode_route = this.params.episode_route;
      var show_route = this.params.show_route;
      Meteor.subscribe('episode_from_route', episode_route, function() {
        var episode = Episodes.findOne({route:episode_route});
        if (episode && episode.trial && !(episode.editor_id == Meteor.userId())) {
          go_to('on_boarding', pause);
        } else if (!episode.trial && Meteor.subscribe('user_roles', Meteor.userId()).ready() && !Roles.userIsInRole(Meteor.userId(), 'editor')) {
          go_to('on_boarding', pause);
        } else if (episode && episode.editor_id != Meteor.userId()) { //editor who hasn't claimed this episode
          go_to('queue', pause);
        } else if (!episode.chapters || episode.chapters.length == 0) { //just in case
          Meteor.call('add_first_chapter', episode_id);
        }
      });
    },
    waitOn: function() {
      var episode_route = this.params.episode_route;
      var show_route = this.params.show_route;
      return [
        Meteor.subscribe('episode_from_route', episode_route),
        Meteor.subscribe('show_from_route', show_route),
        Meteor.subscribe('highlights_from_episode_route', episode_route),
        Meteor.subscribe('people_names'),
        Meteor.subscribe('company_names'),
        Meteor.subscribe('people_from_episode_route', episode_route),
        Meteor.subscribe('chapters_from_episode_route', episode_route),
        Meteor.subscribe('companies_from_episode_route', episode_route)
      ];
    },
    data: function() {
      if (!this.ready()) {
        return;
      }
      var episode_route = this.params.episode_route;
      var show_route = this.params.show_route;
      var show = Shows.findOne({
          route:show_route
        }, {
          reactive:false, fields:{name:true}
        });
      var show_title = '';
      if (show) {
        var show_title = show.name;
      }

      var episode = Episodes.findOne({route:episode_route});
      return {
        episode:episode,
        show_title:show_title
      };
    }
  });

  this.route('editor_account', {
    path:'/editor/account',
    waitOn: function() {
      return [
        Meteor.subscribe('episodes_by_editor', Meteor.userId())
      ]
    }
  })

  this.route('episodes_edit',{
    path: '/episodes/:episode_route/edit',
    waitOn: function () {
      return Meteor.subscribe( 'episode_from_route', this.params.episode_route );
    },
    data: function () {
      return Episodes.findOne({
        route: this.params.episode_route
      });
    }

  });

  this.route('episodes_list', {
    path: '/:route/episodes',
    waitOn: function () {
      return Meteor.subscribe('episodes_from_show', this.params.route.toLowerCase());
    },
    data: function () {
      return { episodes: Episodes.find( {show_route: this.params.route.toLowerCase()} ) };
    }
  });

  this.route('episodes_new', {
    path: '/:route/episodes/new',
    waitOn: function () {
      return Meteor.subscribe('show_from_route', this.params.route);
    },
    data: function () {
      return Shows.findOne({route: this.params.route});
    }
  });

  this.route('episodes_postedited', {
    path: '/episodes/postedited',
    waitOn: function () {
      return Meteor.subscribe('episodes_postedited_pending_publication');
    },
    data: function () {
      return { episodes: Episodes.find({postedited:true, published:false}) };
    }
  });

  this.route('guidelines', {
    path: '/guidelines'
  });

  this.route('home', {
    path: '/',
    onBeforeAction: function(pause) { //Temporary until we open up Home
      if (!SHOW_HOME) {
        if (!Meteor.loggingIn() && Roles.userIsInRole(Meteor.userId(), 'editor')) {
          go_to('queue', pause);
        } else if (!Meteor.loggingIn() && !Roles.userIsInRole(Meteor.userId(), 'editor')) {
          go_to(on_boarding, pause);
        } else {
          go_to(sign_in, pause);
        }
      }
    },
    waitOn: function () {
      return [
        Meteor.subscribe('published_episodes'), //TODO: Limit in some way (time / whatever)
        Meteor.subscribe('shows_with_published_episodes'), // TODO: Limit like above
        Meteor.subscribe('people_names'),
      ];
    },
  });

  this.route('infringement-policy', {
    path: '/infringement-policy'
  });

  this.route('on_boarding', {
    path: '/new-editor'
  });

  this.route('people_edit',{
    path: '/people/:id/edit',
    waitOn: function () {
      return Meteor.subscribe( 'person_from_id', this.params.id );
    },
    data: function () {
      return People.findOne({ _id: this.params.id});
    }
  });

  this.route('people_list',{
    path: 'people',
    waitOn: function () {
      return Meteor.subscribe('people_list');
    },
    data: function () {
      return { people: People.find() };
    }
  });

  this.route('people_new', {
    path: '/people/new',
  });

  this.route('preview', {
    path: '/preview/:show_route/:episode_route',
    template: 'viewer',
    waitOn: function() {
      return viewer_subscriptions(
        this.params.show_route.toLowerCase(), this.params.episode_route.toLowerCase()
      );
    },
    data: function() {
      if (!this.ready()) {
        return;
      }
      var show_route = this.params.show_route.toLowerCase();
      var episode_route = this.params.episode_route.toLowerCase();

      var show = Shows.findOne({route:show_route}, {
        reactive:false, fields:{name:true}
      });
      var show_title = '';
      if (show) {
        var show_title = show.name;
      }

      var episode = Episodes.findOne({route:episode_route});
      return {
        episode:episode,
        show_title:show_title,
        published:false
      };
    }
  });

  this.route('privacy-policy', {
    path: '/privacy-policy'
  });

  this.route('profile', {
    path: '/profile',
  })

  this.route('queue', {
    path: '/queue',
    onBeforeAction: function(pause) {
      var user = Meteor.user();
      if (!Meteor.loggingIn() && !has_email(user)) {
        go_to(on_boarding, pause);
      }
    },
    waitOn: function() {
      if (!Meteor.loggingIn() && Roles.userIsInRole(Meteor.userId(), 'editor')) {
        return [
          Meteor.subscribe('unpublished_episodes'),
          Meteor.subscribe('shows_with_unpublished_episodes')
        ]
      } else if (!Meteor.loggingIn()) {
        return [
          Meteor.subscribe('trial_episodes', Meteor.userId()),
          Meteor.subscribe('trial_shows', Meteor.userId())
        ];
      }
    }
  });

  this.route('shows_edit', {
    path: '/shows/:route/edit',
    waitOn: function () {
      return Meteor.subscribe( 'show_from_route', this.params.route.toLowerCase() );
    },
    data: function () {
      return Shows.findOne({ route: this.params.route.toLowerCase() });
    }
  });

  this.route('shows_list', {
    path: '/shows',
    waitOn: function () {
      return Meteor.subscribe('shows_list');
    },
    data: function () {
      return { shows: Shows.find() };
    }
  });

  this.route('shows_new', {
    path: '/shows/new'
  });

  this.route('terms-of-service', {
    path: '/terms-of-service'
  });

  this.route('users_edit',{
    path: '/users/:id/edit',
    waitOn: function () {
      return Meteor.subscribe('user_from_id', this.params.id);
    },
    data: function () {
      return Meteor.users.findOne({_id: this.params.id});
    }
  });

  this.route('users_list',{
    path: '/users',
    waitOn: function () {
      return Meteor.subscribe('users_list');
    },
    data: function () {
      return { users: Meteor.users.find() };
    }
  });

  this.route('viewer', {
    path: '/view/:show_route/:episode_route',
    waitOn: function() {
      var show_route = this.params.show_route.toLowerCase()
      var episode_route = this.params.episode_route.toLowerCase();
      var subscriptions = viewer_subscriptions(show_route, episode_route);
      subscriptions.push(Meteor.subscribe('bookmarks_from_episode_route_and_user_id', episode_route, Meteor.userId()));
      return subscriptions;
    },
    data: function() {
      if (!this.ready()) {
        return;
      }
      var show_route = this.params.show_route.toLowerCase();
      var episode_route = this.params.episode_route.toLowerCase();

      var show = Shows.findOne({route:show_route}, {
        reactive:false, fields:{name:true}
      });
      var show_title = '';
      if (show) {
        var show_title = show.name;
      }

      var episode = Episodes.findOne({route:episode_route});
      return {
        episode:episode,
        show_title:show_title,
        published:true
      };
    }
  });
});

var viewer_subscriptions = function(show_route, episode_route) {
  return [
    Meteor.subscribe('episode_from_route', episode_route),
    Meteor.subscribe('show_from_route', show_route),
    Meteor.subscribe('highlights_from_episode_route', episode_route),
    Meteor.subscribe('people_from_episode_route', episode_route),
    Meteor.subscribe('chapters_from_episode_route', episode_route),
    Meteor.subscribe('company_names_from_episode_route', episode_route),
  ];
}
