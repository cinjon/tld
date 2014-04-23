Template._small_modal.helpers({
  value: function(key) {
    return this[key]
  }
});

Template.add_person_modal.helpers({
  input_warning: function() {
    return {
      'title':'Add Person',
      'body':'Please include a first and last name'
    }
  }
});

Template.remove_person_modal.helpers({
  input_warning: function() {
    return {
      'title':'Remove Person',
      'body':"Please remove any attributed highlights before removing a person"
    }
  }
});

Template.set_postedited_success_modal.helpers({
  input_warning: function() {
    return {
      'title':'Submitted Edits',
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
