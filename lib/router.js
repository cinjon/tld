// Iron-router routes

var SHOW_VIEWER = false;

var ir_before_hooks = {
  is_admin: function() {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
      this.redirect('home');
    }
  },
  is_editor: function() {
    if (!Meteor.userId()) {
      this.redirect('home');
    } else if (Meteor.subscribe('user_roles', Meteor.userId()).ready() && !Roles.userIsInRole(Meteor.userId(), 'editor')) {
      this.redirect('home');
    }
  },
  show_viewer: function() {
    if (!SHOW_VIEWER) {
      this.redirect('home');
    }
  }
};

Router.onBeforeAction(ir_before_hooks.show_viewer, {only:['viewer']});
if (Meteor.isClient) {
  Router.onBeforeAction(ir_before_hooks.is_admin, {only:['admin']});
  // Router.onBeforeAction(ir_before_hooks.is_editor, {only:['editor', 'queue', 'staging']});
}

Router.configure({
  layoutTemplate: 'layout',
});

Router.map( function() {
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
    path: '/editor/:route/:number',
    waitOn: function() {
      var route = this.params.route.toLowerCase();
      var number = parseInt(this.params.number);
      return [
        Meteor.subscribe('episode_from_show', route, number),
        Meteor.subscribe('show_from_route', route),
        Meteor.subscribe('highlights_from_episode', route, number),
        Meteor.subscribe('people_names'),
        Meteor.subscribe('company_names'),
        Meteor.subscribe('people_from_episode', route, number)
      ];
    },
    data: function() {
      var params = this.params;
      return {
        route: params.route.toLowerCase(),
        number: parseInt(params.number)
      }
    }
  });

  this.route('episodes_edit',{
    path: '/:show_route/:number/edit',
    waitOn: function () {
      return Meteor.subscribe( 'episode_from_show', this.params.show_route.toLowerCase(), parseInt(this.params.number) );
    },
    data: function () {
      return Episodes.findOne({
        show_route: this.params.show_route.toLowerCase(),
        number: parseInt( this.params.number )
      });
    }

  });

  this.route('episodes_list',{
    path: '/:route/episodes',
    waitOn: function () {
      return Meteor.subscribe('episodes_from_show', this.params.route.toLowerCase());
    },
    data: function () {
      return { episodes: Episodes.find( {show_route: this.params.route.toLowerCase()} ) }
    }
  });

  this.route('episodes_new',{
    path: '/episodes_new',
  });

  this.route('home', {
    path: '/'
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
      return Shows.findOne({route: this.params.route.toLowerCase() });
    }
  });

  this.route('shows_list', {
    path: '/shows',
    waitOn: function () {
      return Meteor.subscribe( 'shows_list' );
    },
    data: function () {
      return { shows: Shows.find() }
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


});
