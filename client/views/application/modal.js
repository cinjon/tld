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

Template.email_validation_warning_modal.helpers({
  input_warning: function() {
    return {
      'modal_id': 'email_validation_warning_modal',
      'body':'Please enter a valid email'
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
