// People
// {
//   first_name: string,
//   last_name: string,
//   twitter: string,
//   avatar: url,
//   homepage: url,
//   host_on: array of show_ids,
//   guest_on: array of episode_ids,
//   // it might make sense to extract host & guest
//   created_at: date,
//   updated_at: date
// }

// this might be useful => https://github.com/BeDifferential/inflectionizer

People = new Meteor.Collection('people', {
  schema: new SimpleSchema({
    first_name: {
      type: String,
      label: 'First Name'
    },
    last_name: {
      type: String,
      label: 'Last Name'
    },
    twitter: {
      type: String,
      label: 'Twitter Username'
    },
    avatar: {
      type: String,
      label: 'Avatar URL'
    },
    homepage: {
      type: String,
      label: 'Homepage URL'
    },
    host_on: {
      type: [String],
      label: 'Host on Show IDs Array'
    },
    guest_on: {
      type: [String],
      label: 'Guest on Show IDs array'
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

make_person = function(first_name, last_name, twitter, avatar, homepage,
                       host_on, guest_on, created_at) {
  //TODO: put in schema for this s.t. created_at is automatcially filled
  created_at = created_at || (new Date()).getTime();
  hosts = hosts || [];
  guests = guests || [];
  return People.insert({first_name:first_name, last_name:last_name,
                       twitter:twitter, avatar:avatar, homepage:homepage,
                       host_on:host_on, guest_on:guest_on, created_at:created_at, updated_at:created_at});
}
