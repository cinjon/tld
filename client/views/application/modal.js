Template._small_modal.helpers({
  value: function(key) {
    return this[key]
  }
});

Template.add_person_modal.helpers({
  input_warning: function() {
    return {
      'body':'Please include a first and last name'
    }
  }
});

Template.remove_entity_modal.helpers({
  input_warning: function() {
    return {
      'body':"Please delete any attributed highlights before removing a person or sponsor"
    }
  }
});

Template.set_postedited_success_modal.helpers({
  input_warning: function() {
    return {
      'body':'Success - thanks so much. Note that any further changes will require you to re-submit.'
    }
  }
});

Template.set_postedited_failure_modal.helpers({
  input_warning: function() {
    return {
      'title':'Submitted Edits',
      'body':'Failure - sorry about that. Please try again.'
    }
  }
});
