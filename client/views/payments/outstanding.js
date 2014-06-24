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
          fn: function (value, object) {
            var edit_url = "/payments/" + object._id + "/edit";
            return new Spacebars.SafeString("<a href="+edit_url+">"+value+"</a>");
          }
        },
        {
          key: 'editor_id',
          label: "Editor",
          fn: function (value, object) {
            var edit_url = "/users/" + object.editor_id + "/edit";
            return new Spacebars.SafeString("<a href="+edit_url+">"+value+"</a>");
          }
        },
        {
          key: 'seconds',
          label: "Total Time"
        }
      ]
    };
  }
});
