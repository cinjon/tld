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
}

Router.before(ir_before_hooks.show_viewer, {only:['viewer']});
if (Meteor.isClient) {
  Router.before(ir_before_hooks.is_admin, {only:['admin']});
  Router.before(ir_before_hooks.is_editor, {only:['editor', 'queue', 'staging']});
}

Router.configure({
  layoutTemplate: 'layout',
});

Router.map( function() {

  this.route( 'home', {
    path: '/'
  });

  this.route('editor', {
    path: '/editor/:route/:number',
    waitOn: function() {
      var route = this.params.route;
      var number = parseInt(this.params.number);
      return [
        Meteor.subscribe('episode_from_show', route, number),
        Meteor.subscribe('show_from_route', route),
        Meteor.subscribe('highlights_from_episode', route, number),
        Meteor.subscribe('people_from_episode', route, number)
      ]
    },
    data: function() {
      var route = this.params.route;
      var number = parseInt(this.params.number);
      return {
        episode: Episodes.findOne({
          show_route:route, number:number}),
        show_title: Shows.findOne({
          route:route})
      }
    }
  });

});
