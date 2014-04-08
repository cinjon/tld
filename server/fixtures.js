Meteor.startup( function() {
  //bootstrap an empty db
  var timestamp = new Date();

  if (Meteor.users.find().count() == 0) {
    // USERS AND ROLES
    var cinjon_id = Accounts.createUser({
      email:'cinjon.resnick@gmail.com',
      password:'sharpsharksshank',
      username:'cinjon'
    });

    Roles.addUsersToRoles(cinjon_id, ['admin', 'editor']);

    var matt_id = Accounts.createUser({
      email:'matthewt@gmail.com',
      password:'greenfishpray',
      username:'matt'
    });

    Roles.addUsersToRoles(matt_id, ['admin', 'editor']);

    var admin_id = Accounts.createUser({
      email:'admin@tld',
      password:'admin',
      username:'Admin'
    });

    Roles.addUsersToRoles(admin_id, ['admin', 'editor']);

    var editor_id = Accounts.createUser({
      email:'editor@tld',
      password:'editor',
      username:'Editor'
    });

    Roles.addUsersToRoles(editor_id, ['editor']);
  }

  // SHOWS
  if (Shows.find().count() === 0) {
    var backtowork_id = Shows.insert({
      name: 'Back to Work',
      homepage: 'http://5by5.tv/b2w',
      feed: "http://feeds.5by5.tv/b2w",
      description: "Back to Work is an award winning talk show with Merlin Mann and Dan Benjamin discussing productivity, communication, work, barriers, constraints, tools, and more.",
      artwork: null,
      route: make_name_route('Back To Work'),
      feed_checked_at: timestamp
    });

    var nerdist_id = Shows.insert({
      name: 'Nerdist',
      homepage: 'http://www.nerdist.com/podcast/nerdist/',
      feed: "http://nerdist.libsyn.com/rss",
      description: "I am Chris Hardwick. I am on TV a lot and have a blog at nerdist.com. This podcast is basically just me talking about stuff and things with my two nerdy friends Jonah Ray and Matt Mira, and usually someone more famous than all of us. Occasionally we swear because that is fun. I hope you like it, but if you don't I'm sure you will not hesitate to unfurl your rage in the 'reviews' section because that's how the Internet works.",
      artwork: null,
      route: make_name_route('Nerdist'),
      feed_checked_at: timestamp
    });
  }

  if (Episodes.find().count() === 0) {
    // EPISODES
    var backtowork001 = make_episode(
      "audio", "mp3", "Back to Work 001",
      1, "c8b1b604524c39612ba0be3423ca4669",
      'back-to-work', backtowork_id, [], [],
      [], [], false, null, 5368, timestamp, false,
      'Back to Work 001', 'http://5by5.tv/b2w/1',
      'Tue, 18 Jan 2011 20:00:00 GMT',
      "In the inaugural episode of Back to Work, Merlin Mann and Dan Benjamin discuss why they’re doing this show, getting back to work instead of buying berets, the lizard brain, and compare the Shadow of the Mouse to San Francisco, and eventually get to some practical tips for removing friction.",
      'http://5by5.tv/b2w/1',
      'http://d.5by5.net/redirect.mp3/cdn.5by5.tv/audio/broadcasts/b2w/2011/b2w-001.mp3'
    )

    var backtowork002 = make_episode(
      "audio", "mp3", "Back to Work 002",
      2, "118d07e7ac1adfdc6cd8b97400001a87",
      'back-to-work', backtowork_id, [], [],
      [], [], false, null, 4122, timestamp, false,
      'Back to Work 002', 'http://5by5.tv/b2w/2',
      'Tue, 25 Jan 2011 19:00:00 GMT',
      'Merlin Mann and Dan Benjamin formulate a five-minute warning tactic before discussing the reality of bringing change to your company, some patterns that work for startups, solving the right problem at the right level, why you can’t find the innovation button, and using PathFinder as a Finder replacement.',
      'http://5by5.tv/b2w/2',
      'http://d.5by5.net/redirect.mp3/cdn.5by5.tv/audio/broadcasts/b2w/2011/b2w-002.mp3'
    )

    var nerdist = make_episode(
      "audio", "mp3", "Moby",
      457, "bde5a8980a18df163c1f80618bdbd6d6",
      'nerdist', nerdist_id, [], [],
      [], [], false, null, 4770, timestamp, false,
      'Moby', 'http://www.nerdist.com/2013/12/nerdist-podcast-moby/',
      'Mon, 23 Dec 2013 09:30:00 +0000',
      "Moby sits down with Chris and Jonah to talk about becoming sober (losing the 'sorry, I was super drunk' excuse), sampling, raves, inter-genre overlap in the music industry, L.A. architecture, partying, and a deep conversation about compartmentalizing and human cognition!",
      'd71f0ad3a64e97f085d7aaf19bbb0666',
      "http://www.podtrac.com/pts/redirect.mp3/traffic.libsyn.com/nerdist/Nerdist_457_-_Moby.mp3"
    )
  }
});
