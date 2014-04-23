// Iron-router routes

var SHOW_VIEWER = true;
var sign_in = 'entrySignIn';

var ir_before_hooks = {
  is_admin: function(pause) {
    role_check('admin', sign_in, pause);
  },
  is_editor: function(pause) {
    role_check('editor', sign_in, pause);
  },
  is_trial_editor: function(pause) {
    role_check('trial_editor', sign_in, pause);
  },
  is_signed_in: function(pause) {
    if (Meteor.userId()) {
      go_to('home', pause);
    }
  },
  redirect_to_sign_in: function(pause) {
    if (!(Meteor.user() || Meteor.loggingIn())) {
      go_to(sign_in, pause);
    }
  },
  show_viewer: function(pause) {
    if (!SHOW_VIEWER) {
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

var role_check = function(role, redirect, pause) {
  redirect = redirect || 'home';
  if (Meteor.subscribe('user_roles', Meteor.userId()).ready() && !Roles.userIsInRole(Meteor.userId(), role)) {
    go_to(redirect, pause);
  }
};

Router.onBeforeAction(ir_before_hooks.redirect_to_sign_in, {only:['admin', 'editor', 'queue']});
Router.onBeforeAction(ir_before_hooks.show_viewer, {only:['viewer']});
Router.onBeforeAction(ir_before_hooks.is_signed_in, {only:['entrySignIn', 'entrySignUp']});
Router.onBeforeAction(ir_before_hooks.is_trial_editor, {only:['on_boarding']});
Router.onBeforeAction(ir_before_hooks.is_admin, {only:[
                                                        'admin',
                                                        'companies_edit', 'companies_list', 'companies_new',
                                                        'episodes_edit', 'episodes_list', 'episodes_new',
                                                        'people_edit', 'people_list', 'people_new',
                                                        'shows_edit', 'shows_list', 'show_new',
                                                        'users_edit', 'users_list',
                                                        ]
                                                      });
Router.onBeforeAction(ir_before_hooks.is_editor, {only:['editor', 'queue']});

Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: 'not_found'
});

Router.map( function() {
  this.route('admin', {
    path: '/admin',
    waitOn: function() {
      return [
        Meteor.subscribe('usernames_and_roles')
      ];
    },
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

  this.route('editor', {
    path: '/editor/:route/:episode_id',
    onBeforeAction: function(pause) {
      var episode_id = this.params.episode_id;
      var episode = Episodes.findOne({_id:episode_id});
      if (episode && (!episode.chapters || episode.chapters.length == 0)) {
        var chapter_id = make_chapter(
          'Introduction', true, episode_id, editor_id, 0, [], null);
        Episodes.update({_id:episode_id}, {$addToSet:{chapters:chapter_id}});
      }
      if (episode && episode.editor_id != Meteor.userId()) { //editor who hasn't claimed this episode
        go_to('queue', pause);
      }
    },
    waitOn: function() {
      var episode_id = this.params.episode_id;
      var show_route = this.params.route;
      return [
        Meteor.subscribe('episode_from_id', episode_id),
        Meteor.subscribe('show_from_route', show_route),
        Meteor.subscribe('highlights_from_episode', episode_id),
        Meteor.subscribe('people_names'),
        Meteor.subscribe('company_names'),
        Meteor.subscribe('people_from_episode', episode_id),
        Meteor.subscribe('chapters_from_episode', episode_id)
      ];
    },
    data: function() {
      if (!this.ready()) {
        return;
      }
      var episode_id = this.params.episode_id;
      var show_route = this.params.route;
      var show = Shows.findOne({
          route:show_route
        }, {
          reactive:false, fields:{name:true}
        });
      var show_title = '';
      if (show) {
        var show_title = show.name;
      }

      var episode = Episodes.findOne({_id:episode_id});
      return {
        episode:episode,
        show_title:show_title
      };
    }
  });

  this.route('episodes_edit',{
    path: '/:show_route/episodes/:id/edit',
    waitOn: function () {
      return Meteor.subscribe( 'episode_from_id', this.params.id );
    },
    data: function () {
      return Episodes.findOne({
        _id: this.params.id
      });
    }

  });

  this.route('episodes_list',{
    path: '/:route/episodes',
    waitOn: function () {
      return Meteor.subscribe('episodes_from_show', this.params.route.toLowerCase());
    },
    data: function () {
      return { episodes: Episodes.find( {show_route: this.params.route.toLowerCase()} ) };
    }
  });

  this.route('episodes_new',{
    path: '/:route/episodes/new'
    // #TODO: populate show_route and show_id fields
  });

  this.route('home', {
    path: '/'
  });

  this.route('on_boarding', {
    path: '/editor',
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

  this.route('people_new',{
    path: '/people/new',
  });

  this.route('queue', {
    path: '/queue',
    waitOn: function() {
      return [
        Meteor.subscribe('unpublished_episodes'),
        Meteor.subscribe('shows_with_unpublished_episodes')
      ];
    },
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

  this.route('static', {
    path: '/static/terms-of-service',
    template: 'terms-of-service'
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
      var show_route = this.params.show_route.toLowerCase();
      var episode_route = this.params.episode_route.toLowerCase();
      return [
        Meteor.subscribe('episode_from_route', episode_route),
        Meteor.subscribe('show_from_route', show_route),
        Meteor.subscribe('highlights_from_episode_route', episode_route),
        Meteor.subscribe('people_from_episode_route', episode_route),
        Meteor.subscribe('chapters_from_episode_route', episode_route),
        Meteor.subscribe('company_names_from_episode_route', episode_route)
      ];
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
        show_title:show_title
      };
    }
  });
});
