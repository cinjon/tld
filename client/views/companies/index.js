var companies_reactivity = new ReactiveDict;

Template.companies_list.created = function() {
  companies_reactivity.set('merge_me', null);
  companies_reactivity.set('merge_into', null);
}

Template.companies_list.destroyed = function() {
  companies_reactivity.set('merge_me', null);
  companies_reactivity.set('merge_into', null);
}

Template.companies_list.events({
  'click .reactive-table tr': function (e, tmpl) {
    if ($(e.target).attr('class') == 'delete_company') {
      Meteor.call('delete_company', this._id);
    }
  }
});

Template.companies_list.helpers({
  settings: function () {
    return {
      rowsPerPage: 30,
      showFilter: true,
      useFontAwesome: true,
      showNavigation: 'auto',
      fields: [
        {
          key: 'name',
          label: 'Name',
          fn: function (value, object) {
            var edit_url = "/companies/" + object._id + "/edit";
            return new Spacebars.SafeString("<a href="+edit_url+">"+value+"</a>")
          }
        },
        {
          key: 'homepage',
          label: 'Homepage'
        },
        {
          key: 'twitter',
          label: 'Twitter'
        },
        {
          key: 'deleteme',
          label: 'Delete',
          fn: function(value, object) {
            return new Spacebars.SafeString("<a href=delete_company>Delete</a>");
          }
        }
      ]
    };
  }
});

Template.merge_companies.events({
  'click #submit_merge_companies': function(e, tmpl) {
    var company_a = companies_reactivity.get('merge_me');
    var company_b = companies_reactivity.get('merge_into');
    if (!company_a || company_a == '' || !company_b || company_b == '') {
      return;
    } else {
      Meteor.call('merge_companies', company_a, company_b, function(err, result) {
        $('.typeahead').val('');
      });
    }
  }
});

Template.merge_companies.helpers({
  company_typeahead: function() {
    return Companies.find().fetch().map(function(company) {
      return {'value':company.name, 'id':company._id}
    });
  },
  on_merge_from: function(event, datum, name) {
    companies_reactivity.set('merge_me', datum.id);
  },
  on_merge_into: function(event, datum, name) {
    companies_reactivity.set('merge_into', datum.id);
  },
})

Template.merge_companies.rendered = function() {
  Meteor.typeahead($('#company_merge_from'));
  Meteor.typeahead($('#company_merge_into'));
}
