// People
// {
//   first_name: string,
//   last_name: string,
//   twitter: string,
//   avatar: url,
//   homepage: url,
//   hosts: array of show_ids,
//   guests: array of episode_ids,
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
      autoValue: function() {
        if (this.field("twitter").isSet) {
          return twitter_avatar_url(this.field("twitter").value);
        }
      },
      denyInsert: false,
      optional: true
    },
    homepage: {
      type: String,
      label: 'Homepage URL',
      optional: true
    },
    hosts: {
      type: [String],
      label: 'Host on Show IDs Array'
    },
    guests: {
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

make_person = function(first_name, last_name, twitter, homepage,
                       hosts, guests) {
  //TODO: put in schema for this s.t. created_at is automatcially filled
  hosts = hosts || [];
  guests = guests || [];
  avatar = twitter_avatar_url(twitter);
  return People.insert({first_name:first_name, last_name:last_name,
                       twitter:twitter, homepage:homepage,
                       hosts:hosts, guests:guests});
};

wrapped_twitter_get = Async.wrap(twitter, 'get');

twitter_avatar_url = function(name) {
  var response = wrapped_twitter_get('users/show', {screen_name: name});
  if (response.profile_image_url) {
    return response.profile_image_url;
  } else {
    return "";
  }
};
