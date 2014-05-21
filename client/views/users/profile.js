Template.profile.events({
  'click #reset_password_email': function(e, tmpl) {
    Meteor.call('reset_password', Meteor.userId());
  },
  'click #update_email': function(e, tmpl) {
    var password = tmpl.$('#email_password').val();
    var new_email = tmpl.$('#new_email').val();
    if (password == '' || new_email == '') {
      $('#complete_all_fields_modal').modal(
        {keyboard:true, show:true}
      );
    } else {
      check_password(password, function(err, result) {
        if (result) {
          Meteor.call('add_user_email', Meteor.userId(), new_email, function(error, result) {
            if (result == 'validation') {
              $('#email_validation_warning_modal').modal(
                {keyboard:true, show:true}
              );
            } else if (result == 'exists') {
              $('#email_exists_warning_modal').modal(
                {keyboard:true, show:true}
              );
            } else if (result == 'success') {
              $('#changed_email_modal').modal(
                {keyboard:true, show:true}
              );
            }
          });
        } else {
          $('#password_wrong_modal').modal(
            {keyboard:true, show:true}
          );
          tmpl.$('#email_password').val('');
        }
      });
    }
  },
  'click #update_password': function(e, tmpl) {
    var current_password = tmpl.$('#current_password').val();
    var new_password = tmpl.$('#new_password').val();
    if (current_password == '' || new_password == '') {
      $('#complete_all_fields_modal').modal(
        {keyboard:true, show:true}
      );
    } else {
      Accounts.changePassword(current_password, new_password, function(err) {
        console.log(err);
        if (err) {
          $('#password_wrong_modal').modal(
            {keyboard:true, show:true}
          );
        } else {
          $('#password_changed_modal').modal(
            {keyboard:true, show:true}
          );
        }
      });
    }
  },
  'click #delete_account': function(e, tmpl) {
    //Delete account and remove all references to it elsewhere
  }
})

Template.profile.helpers({
  email: function() {
    var user = Meteor.user();
    if (user && user.emails && user.emails[0] && user.emails[0]['address']) {
      return user.emails[0]['address'];
    }
    return null;
  }
});
