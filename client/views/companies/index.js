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
    var company_a = tmpl.$('#company_a').val();
    var company_b = tmpl.$('#company_b').val();
    if (company_a == '' || company_b == '') {
      return;
    } else {
      Meteor.call('merge_companies', null, null);
    }
  }
});

Template.merge_companies.helpers({
  company_typeahead: function() {
    return Companies.find().fetch().map(function(company) {
      return company.name;
    });
  }
})

//How to get the id of the element?
Template.merge_companies.rendered = function() {
  Meteor.typeahead($('.typeahead'));
}
