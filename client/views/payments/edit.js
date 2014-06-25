Template.payments_edit.edit_document = function () {
  return this;
};

Template.payments_edit.events({
  'click button': function (e, tmpl) {
    Meteor.call("send_payment_receipt_email", this);
  }
});
