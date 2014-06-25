var people_reactivity = new ReactiveDict;

Template.people_list.created = function() {
  people_reactivity.set('merge_me', null);
  people_reactivity.set('merge_into', null);
}

Template.people_list.destroyed = function() {
  people_reactivity.set('merge_me', null);
  people_reactivity.set('merge_into', null);
}

Template.people_list.events({
  'click .reactive-table tr': function (e, tmpl) {
    if ($(e.target).attr('class') == 'delete_person') {
      Meteor.call('delete_person', this._id);
    }
  }
});

Template.people_list.helpers({
  people: function() {
    return People.find({}, {sort:{name:1}})
  },
  settings: function () {
    return {
      rowsPerPage: 30,
      showFilter: true,
      useFontAwesome: true,
      showNavigation: 'auto',
      fields: [
        {
          key: 'first_name',
          label: 'First',
          fn: function (value, object) {
            var edit_url = "/people/" + object._id + "/edit";
            return new Spacebars.SafeString("<a href="+edit_url+">"+object.first_name+"</a>")
          }
        },
        {
          key: 'last_name',
          label: 'Last',
          fn: function (value, object) {
            var edit_url = "/people/" + object._id + "/edit";
            return new Spacebars.SafeString("<a href="+edit_url+">"+object.last_name+"</a>")
          }
        },
        {
          key: 'twitter',
          label: 'Twitter'
        },
        {
          key: 'homepage',
          label: 'Homepage'
        },
        {
          key: 'confirmed',
          label: 'Confirmed?'
        }
      ]
    };
  }
});

Template.merge_people.events({
  'click #submit_merge_people': function(e, tmpl) {
    var person_a = people_reactivity.get('merge_me');
    var person_b = people_reactivity.get('merge_into');
    if (!person_a || person_a == '' || !person_b || person_b == '') {
      return;
    } else if (person_a != person_b) {
      Meteor.call('merge_people', person_a, person_b, function(err, result) {
        $('.typeahead').val('');
      });
    }
  }
});

Template.merge_people.helpers({
  people_typeahead: function() {
    return People.find().fetch().map(function(person) {
      return {'value':person.first_name + ' ' + person.last_name, 'id':person._id}
    });
  },
  on_merge_from: function(event, datum, name) {
    people_reactivity.set('merge_me', datum.id);
  },
  on_merge_into: function(event, datum, name) {
    people_reactivity.set('merge_into', datum.id);
  },
})

Template.merge_people.rendered = function() {
  Meteor.typeahead($('#people_merge_from'));
  Meteor.typeahead($('#people_merge_into'));
}
