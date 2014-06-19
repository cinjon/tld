Template.payments_outstanding.events({
  'click button': function (e, tmpl) {
    Meteor.call("generate_payments");
  }
});

Template.payments_outstanding.helpers({
  payments: function () {
    return Payments.find({issued: false});
  },
  settings: function () {
    return {
      rowsPerPage: 20,
      showFilter: true,
      useFontAwesome: true,
      showNavigation: 'auto',
      fields: [
        {
          key: '_id',
          label: 'Payment ID',
        },
        {
          key: 'editor_id',
          label: "Editor"
        },
        {
          key: 'seconds',
          label: "Total Time"
        }
      ]
    };
  }
});
