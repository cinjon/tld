// Companies
// {
//   name: string,
//   homepage: url,
//   twitter: url,
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
    sponsored_episodes: {
      type: [Object],
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

make_company = function(name, homepage, twitter, sponsored_episodes) {
  sponsored_episodes = sponsored_episodes || [];
  return Companies.insert({name:name, homepage:homepage,twitter:twitter,
                           sponsored_episodes:sponsored_episodes});
}
