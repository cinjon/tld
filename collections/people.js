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
People = new Meteor.Collection('people');

make_person = function(first_name, last_name, twitter, avatar, homepage,
                       hosts, guests, created_at) {
  //TODO: put in schema for this s.t. created_at is automatcially filled
  created_at = created_at || (new Date()).getTime();
  hosts = hosts || [];
  guests = guests || [];
  return People.insert({first_name:first_name, last_name:last_name,
                       twitter:twitter, avatar:avatar, homepage:homepage,
                       hosts:hosts, guests:guests, created_at:created_at});
}