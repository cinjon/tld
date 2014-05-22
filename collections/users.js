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


UsersSchema = new SimpleSchema({
  completed_trial: {
    type: Boolean,
    optional: true,
    autoValue: function() {
      if (this.isInsert) {
        return false;
      }
    }
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
  emails: {
    type: Array,
    optional: true
  },
  'emails.$': {
    type: Object,
    blackbox: true
  },
  profile: {
    type: Object,
    blackbox: true,
    optional: true
  },
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
  signed_editor_legal: {
    type: Boolean,
    optional: true,
    autoValue: function() {
      if (this.isInsert) {
        return false;
      }
    }
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
  },
  username:{
    type: String,
    optional: true
  }
});

Meteor.users.attachSchema(UsersSchema);

// UsersCollection.allow({
//   insert: function () {
//     return Roles.userIsInRole(Meteor.userId(), ['admin']);
//   },
//   remove: function () {
//     return Roles.userIsInRole(Meteor.userId(), ['admin']);
//   },
//   update: function () {
//     return Roles.userIsInRole(Meteor.userId(), ['admin']);
//   }
// });
