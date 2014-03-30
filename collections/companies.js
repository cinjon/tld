// Companies
// {
//   name: string,
//   homepage: url,
//   twitter: url,
//   sponsored_episodes: array of sponsored episodes (episode_ids),
//   created_at: date,
//   updated_at: date
// }
Companies = new Meteor.Collection('companies');

make_company = function(name, homepage, twitter,
                        created_at, sponsored_episodes) {
  created_at = created_at || (new Date()).getTime();
  sponsored_episodes = sponsored_episodes || [];
  return Companies.insert({name:name, homepage:homepage,
                           twitter:twitter, created_at:created_at,
                           sponsored_episodes:sponsored_episodes});
}