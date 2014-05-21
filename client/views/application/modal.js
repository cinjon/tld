Template._small_modal.helpers({
  value: function(key) {
    return this[key]
  }
});

Template.add_person_modal.helpers({
  input_warning: function() {
    return {
      'modal_id': 'add_person_modal',
      'body':'Please include a first and last name'
    }
  }
});

Template.changed_email_modal.helpers({
  input_warning: function() {
    return {
      'title':'Email Change',
      'modal_id': 'changed_email_modal',
      'body':"Thanks! We've sent an email to you to verify the change"
    }
  }
});

Template.complete_all_fields_modal.helpers({
  input_warning: function() {
    return {
      'modal_id': 'complete_all_fields_modal',
      'body':'Please complete all fields'
    }
  }
});

Template.email_exists_warning_modal.helpers({
  input_warning: function() {
    return {
      'title': 'Unavailable Email',
      'modal_id': 'email_exists_warning_modal',
      'body':'That email is already in use. Please enter another one.'
    }
  }
});

Template.email_validation_warning_modal.helpers({
  input_warning: function() {
    return {
      'title': 'Invalid Email',
      'modal_id': 'email_validation_warning_modal',
      'body':'Please enter a valid email.'
    }
  }
});

Template.email_success_modal.helpers({
  input_warning: function() {
    return {
      'modal_id': 'email_success_modal',
      'body':'Added your email, thanks!'
    }
  }
});

Template.password_changed_modal.helpers({
  input_warning: function() {
    return {
      'title':'Password Changed',
      'modal_id':'password_changed_modal',
      'body':'Success! Your new password has been set.'
    }
  }
});

Template.password_wrong_modal.helpers({
  input_warning: function() {
    return {
      'title':'Password Incorrect',
      'modal_id':'password_wrong_modal',
      'body':'The password entered is incorrect. Please try again.'
    }
  }
});

Template.remove_entity_modal.helpers({
  input_warning: function() {
    return {
      'modal_id': 'remove_entity_modal',
      'body':"Please delete any attributed highlights before removing a person or sponsor"
    }
  }
});

Template.set_postedited_success_modal.helpers({
  input_warning: function() {
    return {
      'modal_id': 'set_postedited_success_modal',
      'body':'Success - thanks so much. Note that any further changes will require you to re-submit.'
    }
  }
});

Template.set_postedited_failure_modal.helpers({
  input_warning: function() {
    return {
      'title':'Submitted Edits',
      'modal_id': 'set_postedited_failure_modal',
      'body':'Failure - sorry about that. Please try again.'
    }
  }
});