// subscriptions and basic Meteor.startup code
Meteor.startup(function() {
  $('body').attr('color', '#6e6e6e');
  $('body').css('background-color', 'currentColor');
});



if (Meteor.isClient) {
    Template.users_admin.helpers({
        // check if user is an admin
        isAdminUser: function() {
            return Roles.userIsInRole(Meteor.user(), ['admin']);
        }
    })
}
