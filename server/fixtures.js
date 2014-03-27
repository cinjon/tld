Meteor.startup( function() {
  //bootstrap an empty db
  if (Shows.find().count() === 0) {
    var timestamp = (new Date()).getTime();

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
      email:'admin',
      password:'admin',
      username:'Admin'
    });

    var editor_id = Accounts.createUser({
      email:'editor',
      password:'editor',
      username:'Editor'
    });

    Roles.addUsersToRoles(editor_id, ['editor']);
    Roles.addUsersToRoles(admin_id, ['admin', 'editor']);

    var backtowork_id = Shows.insert({
      name: 'Back to Work',
      homepage: 'http://5by5.tv/b2w',
      feed: "http://feeds.5by5.tv/b2w",
      description: "Back to Work is an award winning talk show with Merlin Mann and Dan Benjamin discussing productivity, communication, work, barriers, constraints, tools, and more.",
      created_at: timestamp,
      updated_at: timestamp,
      artwork: null,
      route: 'back-to-work',
    });

    var nerdist_id = Shows.insert({
      name: 'Nerdist',
      homepage: 'http://www.nerdist.com/podcast/nerdist/',
      feed: "http://nerdist.libsyn.com/rss",
      description: "I am Chris Hardwick. I am on TV a lot and have a blog at nerdist.com. This podcast is basically just me talking about stuff and things with my two nerdy friends Jonah Ray and Matt Mira, and usually someone more famous than all of us. Occasionally we swear because that is fun. I hope you like it, but if you don't I'm sure you will not hesitate to unfurl your rage in the 'reviews' section because that's how the Internet works.",
      created_at: timestamp,
      updated_at: timestamp,
      artwork: null,
      route: 'nerdist'
    });


    var backtowork001 = Episodes.insert({
      type: "audio",
      format: "mp3",
      title: "Back to Work 001",
      number: 1,
      source_url: "http://5by5.tv/b2w/1",
      source_note: "In the inaugural episode of Back to Work, Merlin Mann and Dan Benjamin discuss why they’re doing this show, getting back to work instead of buying berets, the lizard brain, and compare the Shadow of the Mouse to San Francisco, and eventually get to some practical tips for removing friction.",
      storage_key: "c8b1b604524c39612ba0be3423ca4669",
      show_route: "back-to-work",
      show_id: backtowork_id,
      hosts: null,
      guests: null,
      edited: false,
      postedited: false,
      editor_id: null,
      length_in_seconds: 5368,
      created_at: timestamp,
      updated_at: timstamp,
      published: false
    });


    var backtowork002 = Episodes.insert({
      type: "audio",
      format: "mp3",
      title: "Back to Work 002",
      number: 1,
      source_url: "http://5by5.tv/b2w/2",
      source_note: "Merlin Mann and Dan Benjamin formulate a five-minute warning tactic before discussing the reality of bringing change to your company, some patterns that work for startups, solving the right problem at the right level, why you can’t find the innovation button, and using PathFinder as a Finder replacement.",
      storage_key: "118d07e7ac1adfdc6cd8b97400001a87",
      show_route: "back-to-work",
      show_id: backtowork_id,
      hosts: null,
      guests: null,
      edited: false,
      postedited: false,
      editor_id: null,
      length_in_seconds: 4122,
      created_at: timestamp,
      updated_at: timstamp,
      published: false
    });

    var nerdist = Episodes.insert({
      type: "audio",
      format: "mp3",
      title: "Moby",
      number: 457,
      source_url: "http://www.nerdist.com/2013/12/nerdist-podcast-moby/",
      source_note: "Moby sits down with Chris and Jonah to talk about becoming sober (losing the 'sorry, I was super drunk' excuse), sampling, raves, inter-genre overlap in the music industry, L.A. architecture, partying, and a deep conversation about compartmentalizing and human cognition!",
      storage_key: "bde5a8980a18df163c1f80618bdbd6d6",
      show_route: "nerdist",
      show_id: nerdist_id,
      hosts: null,
      guests: null,
      edited: false,
      postedited: false,
      editor_id: null,
      length_in_seconds: 4770,
      created_at: timestamp,
      updated_at: timstamp,
      published: false
    });

  }
});
