// People
// {
//   first_name: string,
//   last_name: string,
//   twitter: string,
//   avatar: url,
//   homepage: url,
//   host: array of show_ids,
//   guest: array of episode_ids,
//   // it might make sense to extract host & guest
//   created_at: date,
//   updated_at: date
// }

// this might be useful => https://github.com/BeDifferential/inflectionizer
People = new Meteor.Collection('people');
