// Companies
// {
//   name: string,
//   homepage: url,
//   twitter: url,
//   confirmed: boolean, // Means that editors can't change this company's twitter/names
//   avatar: url,
//   sponsored_episodes: array of sponsored episodes (episode_ids),
//   created_at: date,
//   updated_at: date
// }

Companies = new Meteor.Collection('companies', {
  schema: new SimpleSchema({
    name: {
      type: String,
      label: 'Name'
    },
    homepage: {
      type: String,
      label: 'Homepage Link',
      optional: true
    },
    twitter: {
      type: String,
      label: 'Twitter',
      optional: true
    },
    confirmed: {
      type: Boolean,
      label: 'Confirmed'
    },
    avatar: {
      type: String,
      label: 'Avatar',
      autoValue: function() {
        if (this.field("twitter").value !== null && Meteor.isServer) {
          return twitter_avatar_url(this.field("twitter").value);
        } else if (Meteor.isServer) {
          return twitter_avatar_url("timelinedhq");
        }
      },
      denyInsert: false,
      optional:true
    },
    sponsored_episodes: {
      type: [String],
      label: 'Sponsored Episodes',
      blackbox: true,
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
    updated_at: {
      type: Date,
      autoValue: function() {
        if (this.isUpdate) {
          return new Date();
        }
      },
      denyInsert: true,
      optional: true
    },
  })
});

make_company = function(name, homepage, twitter, sponsored_episodes, confirmed) {
  sponsored_episodes = sponsored_episodes || [];

  var regex = new RegExp(['^', name, '$'].join(''), 'i');
  var company = Companies.findOne({name:regex});
  if (company) {
    Companies.update(
      {
        _id:company._id
      }, {
        $addToSet: {sponsored_episodes: {$each: sponsored_episodes}}
      }
    )
    return company.id;
  } else {
    if (!confirmed) {
      confirmed = false;
    }
    return Companies.insert({name:name, homepage:homepage,twitter:twitter,
                             sponsored_episodes:sponsored_episodes, confirmed:confirmed});
  }
}


Companies.allow({
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
