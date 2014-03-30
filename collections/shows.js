// Shows
// {
//   name: string,
//   homepage: url,
//   feed: url,      // for RSS imports
//   description: string,
//   created_at: date,
//   updated_at: date,
//   artwork: url,  // still deciding
//   route: string,  // name with spaces replaced by -, ex. Joe-Rogan-Experience
//   feed_checked_at: date,  // for use in aggregator
// }
Shows = new Meteor.Collection('shows', {
  schema: {
      name: {
        type: String,
        label: 'Name',
      },
      homepage: {
        type: String,
        label: 'Homepage Link'
      },
      feed: {
        type: String,
        label: 'RSS Feed Link'
      },
      description: {
        type: String,
        label: 'Description'
      },
      created_at: {
        type: Date,
        label: 'Created at'
      },
      updated_at: {
        type: Date,
        label: 'Updated at'
      },
      artwork: {
        type: String,
        label: 'Artwork Link'
      },
      route: {
        type: String,
        label: 'Router path'
      },
      feed_checked_at: {
        type: Date,
        label: 'Feed last checked at'
      }
  }
});
