Template.on_boarding.events({
  'keyup #set_user_email': function(e, tmpl) {
    var val = $(e.target).val().trim();
    if (e.keyCode == 13 && val != '') {
      Meteor.call('add_user_email', Meteor.userId(), val, function(error, result) {
        if (result == 'validation') {
          $('#email_validation_warning_modal').modal(
            {keyboard:true, show:true}
          );
        } else if (result == 'success') {
          $('#email_success_modal').modal(
            {keyboard:true, show:true}
          );
        } else if (result == 'exists') {
          $('#email_exists_warning_modal').modal(
            {keyboard:true, show:true}
          );
        }
      });
    } else {
      $('#user_email').html(val);
    }
  }
});

Template.on_boarding.helpers({
  email: function() {
    return $('#set_user_email').val();
  },
  not_email: function() {
    var user = Meteor.user();
    return !user || !user.emails || user.emails.length == 0 || !('address' in user.emails[0]);
  },
  username: function() {
    var user = Meteor.user();
    if (!user) {
      return '';
    }
    return user.username;
  }
});
