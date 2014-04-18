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
