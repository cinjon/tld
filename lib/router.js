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
Router.onBeforeAction(ir_before_hooks.is_admin, {only:['admin']});
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
    path: '',
  });

  this.route('companies_list',{
    path: '',
  });

  this.route('companies_new',{
    path: '',
  });

  this.route('editor', {
    path: '/editor/:route/:id',
    onBeforeAction: function(pause) {
      var route = this.params.route.toLowerCase();
      var id = this.params.id;
      var episode = Episodes.findOne({
          show_route:route,
          _id:id
        });
      if (episode && episode.editor_id != Meteor.userId()) { //editor who hasn't claimed this episode
        go_to('queue', pause);
      }
    },
    waitOn: function() {
      var route = this.params.route.toLowerCase();
      var id = this.params.id;
      return [
        Meteor.subscribe('episode_from_show', route, id),
        Meteor.subscribe('show_from_route', route),
        Meteor.subscribe('highlights_from_episode', route, id),
        Meteor.subscribe('people_names'),
        Meteor.subscribe('company_names'),
        Meteor.subscribe('people_from_episode', route, id),
        Meteor.subscribe('chapters_from_episode', route, id)
      ];
    },
    data: function() {
      if (!this.ready()) {
        return;
      }
      var route = this.params.route.toLowerCase();
      var id = this.params.id;
      var show = Shows.findOne({
          route:route
        }, {
          reactive:false, fields:{name:true}
        });
      var show_title = '';
      if (show) {
        var show_title = show.name;
      }

      var episode = Episodes.findOne({
          show_route:route,
          _id:id
        });
      return {
        episode:episode,
        show_title:show_title
      };
    }
  });

  this.route('episodes_edit',{
    path: '/:show_route/episodes/:id/edit',
    waitOn: function () {
      return Meteor.subscribe( 'episode_from_show', this.params.show_route.toLowerCase(), this.params.id );
    },
    data: function () {
      return Episodes.findOne({
        show_route: this.params.show_route.toLowerCase(),
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
    path: '/episodes_new',
  });

  this.route('home', {
    path: '/'
  });

  this.route('on_boarding', {
    path: '/editor',
  });

  this.route('people_edit',{
    path: '',
  });

  this.route('people_list',{
    path: '',
  });

  this.route('people_new',{
    path: '',
  });

  this.route('queue', {
    path: '/queue',
    waitOn: function() {
      return [
        Meteor.subscribe('unedited_episodes'),
        Meteor.subscribe('shows_with_unedited_episodes')
      ];
    },
  });

  this.route('shows_edit', {
    // TODO: add role authorization
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
      return Meteor.subscribe( 'shows_list' );
    },
    data: function () {
      return { shows: Shows.find() };
    }
  });

  this.route('shows_new', {
    path: '/shows/new'
  });

  this.route('users_edit',{
    path: '',
  });

  this.route('users_list',{
    path: '',
  });

  this.route('users_new',{
    path: '',
  });

  this.route('viewer', {
    path: '/view/:route/:number',
    waitOn: function() {
      var route = this.params.route.toLowerCase();
      var number = parseInt(this.params.number);
      return [
        Meteor.subscribe('episode_from_show', route, number),
        Meteor.subscribe('show_from_route', route),
        Meteor.subscribe('highlights_from_episode', route, number),
        Meteor.subscribe('people_from_episode', route, number),
        Meteor.subscribe('chapters_from_episode', route, number),
        Meteor.subscribe('company_names_from_episode', route, number)
      ];
    },
    data: function() {
      if (!this.ready()) {
        return;
      }
      var route = this.params.route.toLowerCase();
      var number = parseInt(this.params.number);

      var show = Shows.findOne({
          route:route
        }, {
          reactive:false, fields:{name:true}
        });
      var show_title = '';
      if (show) {
        var show_title = show.name;
      }

      var episode = Episodes.findOne({
          show_route:route,
          number:number
        });
      return {
        episode:episode,
        show_title:show_title
      };
    }
  });
});
