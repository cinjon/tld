Template.payments_outstanding.events({
  'click button': function (e, tmpl) {
    Meteor.call("generate_payments");
  }
});

Template.payments_outstanding.helpers({
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
          label: "Editor",
          fn: function (value, object) {
            var editor = Meteor.users.find(value);
            if (editor) {
              return editor.username + " - " + editor.emails[0].address;
            } else {
              return "";
            }
          }
        },
        {
          key: 'amount',
          label: "$",
          fn: function (value, object) {
            return "$" + amount/100;
          }
        }
      ]
    };
  }
});
