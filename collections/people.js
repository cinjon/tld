// People
// {
//   first_name: string,
//   last_name: string,
//   confirmed: boolean, // Means that editors can't change this person's twitter/names
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
    confirmed: {
      type: Boolean,
      label: 'Confirmed'
    },
    twitter: {
      type: String,
      label: 'Twitter Username',
      optional: true
    },
    avatar: {
      type: String,
      autoValue: function() {
        if (this.field("twitter").value !== null && Meteor.isServer) {
          return twitter_avatar_url(this.field("twitter").value);
        } else if (Meteor.isServer) {
          return twitter_avatar_url("timelinedhq");
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
                       hosts, guests, confirmed) {
  hosts = hosts || [];
  guests = guests || [];
  if (!confirmed) {
    confirmed = false;
  }

  first_name = first_name.toLowerCase();
  last_name = last_name.toLowerCase();

  var person = People.findOne({first_name:first_name, last_name:last_name});
  if (person) {
    People.update(
      {
        _id:person._id
      }, {
        $addToSet: {hosts: {$each: hosts},
                    guests: {$each: guests}
                   }
      }
    )
    return person.id;
  } else {
    return People.insert({first_name:first_name, last_name:last_name,
                          twitter:twitter, homepage:homepage,
                          hosts:hosts, guests:guests, confirmed:confirmed});
  }
};

People.allow({
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
