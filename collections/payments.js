// A payment is a record of a payment to an editor for published episodes.
// Payments
// {
//   _id: string,
//   editor_id: string   // id of the user/editor being issued payment
//   method: string      // payment method (dwolla, check, or ???)
//   episodes: array of episodes included on this invoice
//   minutes: number      // sum of minutes of all episodes on payment
//   amount: number        // payment amount (cents)
//   issued: boolean
//   created_at: date,
//   updated_at: date,
// }

Payments = new Meteor.Collection('payments', {
  schema: new SimpleSchema({
    amount: {
      type: Number,
      label: 'Payment Amount',
      optional: true
    },
    created_at: {
      type: Date,
        autoValue: function() {
        if (this.isInsert) {
          return new Date();
        } else if (this.isUpsert) {
          return {$setOnInsert: new Date()};
        } else {
          this.unset();
        }
      },
      denyUpdate: true
    },
    editor_id: {
      type: String,
      label: "Editor ID"
    },
    episodes: {
      type: [String],
      optional: true
    },
    issued: {
      type: Boolean,
      autoValue: function() {
        if (this.isSet) {
          return this.value;
        } else if (this.isInsert || this.isUpdate) {
          return false;
        }
      }
    },
    method: {
      type: String,
      optional: true
    },
    seconds: {
      type: Number,
      label: 'Total Seconds',
      optional: true,
      autoValue: function() {
        if (this.isSet) {
          return this.value;
        } else if (this.isInsert || this.isUpdate) {
          return 0;
        }
      }
    },
    updated_at: {
      type: Date,
      autoValue: function() {
        if (this.isUpdate) {
          return new Date();
        }
      },
      denyInsert: true,
      optional: true
    }
  })
});


Payments.allow({
  insert: function () {
    return Roles.userIsInRole(Meteor.userId(), ['admin']);
  },
  remove: function () {
    return Roles.userIsInRole(Meteor.userId(), ['admin']);
  },
  update: function () {
    return Roles.userIsInRole(Meteor.userId(), ['admin']);
  }
});
