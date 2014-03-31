Meteor.startup( function() {
  //bootstrap an empty db
  if (Shows.find().count() === 0) {
    var timestamp = new Date();

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


    // SHOWS

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


    // EPISODES


    var backtowork001 = Episodes.insert({
      type: "audio",
      format: "mp3",
      title: "Back to Work 001",
      number: 1,
      storage_key: "c8b1b604524c39612ba0be3423ca4669",
      show_route: 'back-to-work',
      show_id: backtowork_id,
      hosts: null,
      guests: null,
      edited: false,
      postedited: false,
      editor_id: null,
      length_in_seconds: 5368,
      published: false,
      feed: {
        title: 'Back to Work 001',
        url: 'http://5by5.tv/b2w/1',
        summary: "In the inaugural episode of Back to Work, Merlin Mann and Dan Benjamin discuss why they’re doing this show, getting back to work instead of buying berets, the lizard brain, and compare the Shadow of the Mouse to San Francisco, and eventually get to some practical tips for removing friction.",
        published: 'Tue, 18 Jan 2011 20:00:00 GMT',
        entry_id: 'http://5by5.tv/b2w/1',
        enclosure_url: "http://d.5by5.net/redirect.mp3/cdn.5by5.tv/audio/broadcasts/b2w/2011/b2w-001.mp3"
      }
    });


    var backtowork002 = Episodes.insert({
      type: "audio",
      format: "mp3",
      title: "Back to Work 002",
      number: 2,
      storage_key: "118d07e7ac1adfdc6cd8b97400001a87",
      show_route: "back-to-work",
      show_id: backtowork_id,
      hosts: null,
      guests: null,
      edited: false,
      postedited: false,
      editor_id: null,
      length_in_seconds: 4122,
      published: false,
      feed: {
        title: 'Back to Work 002',
        url: 'http://5by5.tv/b2w/2',
        summary: "Merlin Mann and Dan Benjamin formulate a five-minute warning tactic before discussing the reality of bringing change to your company, some patterns that work for startups, solving the right problem at the right level, why you can’t find the innovation button, and using PathFinder as a Finder replacement.",
        published: 'Tue, 25 Jan 2011 19:00:00 GMT',
        entry_id: 'http://5by5.tv/b2w/2',
        enclosure_url: "http://d.5by5.net/redirect.mp3/cdn.5by5.tv/audio/broadcasts/b2w/2011/b2w-002.mp3"
      }
    });

    var nerdist = Episodes.insert({
      type: "audio",
      format: "mp3",
      title: "Moby",
      number: 457,
      storage_key: "bde5a8980a18df163c1f80618bdbd6d6",
      show_route: 'nerdist',
      show_id: nerdist_id,
      hosts: null,
      guests: null,
      edited: false,
      postedited: false,
      editor_id: null,
      length_in_seconds: 4770,
      published: false,
      feed: {
        title: 'Moby',
        url: 'http://www.nerdist.com/2013/12/nerdist-podcast-moby/',
        summary: "Moby sits down with Chris and Jonah to talk about becoming sober (losing the 'sorry, I was super drunk' excuse), sampling, raves, inter-genre overlap in the music industry, L.A. architecture, partying, and a deep conversation about compartmentalizing and human cognition!",
        published: 'Mon, 23 Dec 2013 09:30:00 +0000',
        entry_id: 'd71f0ad3a64e97f085d7aaf19bbb0666',
        enclosure_url: "http://www.podtrac.com/pts/redirect.mp3/traffic.libsyn.com/nerdist/Nerdist_457_-_Moby.mp3"
      }
    });
  }
});
