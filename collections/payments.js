// A payment is a record of a payment to an editor for published episodes.
// Payments
// {
//   _id: string,
//   editor_id: string   // id of the user/editor being issued payment
//   method: string      // payment method (dwolla, check, or ???)
//   method_id: string    // unique identifier for payment method (dwolla transaction id, check #)
//   episodes: [string]  // array of episodes included on this invoice
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
        } else if (this.isInsert) {
          return false;
        }
      }
    },
    method: {
      type: String,
      optional: true
    },
    method_id: {
      type: String,
      label: 'Method ID',
      optional: true
    },
    seconds: {
      type: Number,
      label: 'Total Seconds',
      optional: true,
      autoValue: function() {
        if (this.isSet) {
          return this.value;
        } else if (this.isInsert) {
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

make_payment = function (episode) {
  var payment_id = Payments.insert({
    editor_id: episode.editor_id,
    seconds: episode.length_in_seconds,
    episodes: [episode._id]
  });
  return payment_id;
};


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
