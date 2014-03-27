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
Shows = new Meteor.Collection('shows');
