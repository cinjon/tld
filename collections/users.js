// A user document can contain any data you want to store about a user.
// Meteor treats the following fields specially:
//
// username: a unique String identifying the user.
//
// emails: an Array of Objects with keys address and verified; an email address may belong to at most one user.
// verified is a Boolean which is true if the user has verified the address with a token sent over email.
//
// createdAt: the Date at which the user document was created.
//
// profile: an Object which (by default) the user can create and update with any data.
//
// services: an Object containing data used by particular login services.
// For example, its reset field contains tokens used by forgot password links,
// and its resume field contains tokens used to keep you logged in between sessions.
//
// signed_editor_legal: boolean
// received_trial_email: boolean

userSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  username:{
    type: String,
    optional: true
  },
  emails: {
    type: [Object],
    optional: true
  },
  "emails.$.address": {
    type: String,
    regEx: SimpleSchema.RegEx.Email
    },
  "emails.$.verified": {
    type: Boolean
    },
  profile: {
    type: Object,
    blackbox: true,
    optional: true
  },
  // profile: {
  //   type: userProfileSchema,
  //   optional: true
  // },
  roles: {
    type: [String],
    blackbox: true,
    optional: true
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },
  received_trial_email: {
    type: Boolean,
    optional: true,
    autoValue: function() {
      if (this.isInsert) {
        return false;
      }
    }
  },
  completed_trial: {
    type: Boolean,
    optional: true
  },
  signed_editor_legal: {
    type: Boolean,
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date};
      } else {
        this.unset();
      }
    },
    denyUpdate: true
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: false,
    optional: true
  }
});

Meteor.users.attachSchema(userSchema);

// userProfileSchema = new SimpleSchema({
//     firstName: {
//         type: String,
//         regEx: /^[a-zA-Z-]{2,25}$/,
//         optional: true
//     },//     lastName: {
//         type: String,
//         regEx: /^[a-zA-Z]{2,25}$/,
//         optional: true
//     },
//     birthday: {
//         type: Date,
//         optional: true
//     },
//     gender: {
//         type: String,
//         allowedValues: ['Male', 'Female'],
//         optional: true
//     },
//     organization : {
//         type: String,
//         regEx: /^[a-z0-9A-z .]{3,30}$/,
//         optional: true
//     },
//     website: {
//         type: String,
//         regEx: SimpleSchema.RegEx.Url,
//         optional: true
//     },
//     bio: {
//         type: String,
//         optional: true
//     },
//     // country: {
//     //     type: Schemas.UserCountry,
//     //     optional: true
//     // }
// });

Meteor.users.allow({
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
