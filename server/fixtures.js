Meteor.startup( function() {
  //bootstrap an empty db
  var timestamp = new Date();

  // USERS AND ROLES
  // if (Meteor.users.find().count() === 0) {
  //   var cinjon_id = Accounts.createUser({
  //     email:'cinjon.resnick@gmail.com'
  //     password:'sharpsharksshank',
  //     username:'cinjon'
  //   });

  //   Roles.addUsersToRoles(cinjon_id, ['admin', 'editor']);

    // var matt_id = Accounts.createUser({
    //   email:'matt@timelined.com',
    //   password:'greenfishpray',
    //   username:'matt'
    // });

    // Roles.addUsersToRoles(matt_id, ['admin', 'editor']);

  }

  // SHOWS
  // if (Shows.find().count() === 0) {
  //   var backtowork_id = Shows.insert({
  //     name: "Back to Work",
  //     homepage: "http://5by5.tv/b2w",
  //     feed: "http://feeds.5by5.tv/b2w",
  //     feed_active: true,
  //     description: "Back to Work is an award winning talk show with Merlin Mann and Dan Benjamin discussing productivity, communication, work, barriers, constraints, tools, and more.",
  //     artwork: "http://icebox.5by5.tv/images/broadcasts/19/cover_quarter.jpg",
  //     feed_checked_at: timestamp
  //   });

  //   var nerdist_id = Shows.insert({
  //     name: "Nerdist",
  //     homepage: "http://www.nerdist.com/podcast/nerdist/",
  //     feed: "http://nerdist.libsyn.com/rss",
  //     feed_active: true,
  //     description: "I am Chris Hardwick. I am on TV a lot and have a blog at nerdist.com. This podcast is basically just me talking about stuff and things with my two nerdy friends Jonah Ray and Matt Mira, and usually someone more famous than all of us. Occasionally we swear because that is fun. I hope you like it, but if you don't I'm sure you will not hesitate to unfurl your rage in the 'reviews' section because that's how the Internet works.",
  //     artwork: "http://www.nerdist.com/wp-content/uploads/2011/10/nerdistpodcastv2.png",
  //     feed_checked_at: timestamp
  //   });

  //   var wtf_id = Shows.insert({
  //     name: "WTF with Marc Maron",
  //     homepage: "http://www.wtfpod.com/podcast",
  //     feed: "http://wtfpod.libsyn.com/rss",
  //     feed_active: true,
  //     description: "Comedian Marc Maron is tackling the most complex philosophical question of our day - WTF? He'll get to the bottom of it with help from comedian friends, celebrity guests and the voices in his own head.",
  //     artwork: "https://pbs.twimg.com/profile_images/423276205/Marc_Avatar.jpg",
  //     feed_checked_at: timestamp
  //   });

  //   var joerogan_id = Shows.insert({
  //     name: "The Joe Rogan Experience",
  //     homepage: "http://podcasts.joerogan.net/",
  //     feed: "http://joeroganexp.joerogan.libsynpro.com/rss",
  //     feed_active: true,
  //     description: "The Joe Rogan Experience podcast is a long form conversation hosted by comedian, UFC color commentator, and actor Joe Rogan with friends and guests that have included comedians, actors, musicians, MMA instructors and commentators, authors, artists, and porn stars.",
  //     artwork: "http://upload.wikimedia.org/wikipedia/en/6/60/The_Joe_Rogan_Experience.jpg",
  //     feed_checked_at: timestamp
  //   });

  //   var quit_id = Shows.insert({
  //     name: "Quit!",
  //     homepage: "http://5by5.tv/quit",
  //     feed: "http://feeds.5by5.tv/quit",
  //     feed_active: true,
  //     description: "Ever quit a job? Ever redefined yourself within one? Ever started something and won big ... or failed? QUIT! is a call-in show helping people sort out their lives, reevaluate their options, kick their crummy jobs, and start something awesome. Call in live at 512-518-5714 or leave a voicemail at 512-222-8141.",
  //     artwork: "http://icebox.5by5.tv/images/broadcasts/44/cover_quarter.jpg",
  //     feed_checked_at: timestamp
  //   });

  //   var thetalkshow_id = Shows.insert({
  //     name: "The Talk Show",
  //     homepage: "http://www.muleradio.net/thetalkshow/",
  //     feed: "http://feeds.muleradio.net/thetalkshow",
  //     feed_active: true,
  //     description: "Sort of like the director’s commentary track for Daring Fireball.",
  //     artwork: "http://www.muleradio.net/images/shows/thetalkshow/hero.jpg",
  //     feed_checked_at: timestamp
  //   });

  //   var nextmarket_id = Shows.insert({
  //     name: "The NextMarket Podcast",
  //     homepage: "http://nextmarket.co/pages/podcast",
  //     feed: "http://feeds.feedburner.com/soundcloud/JEcj",
  //     feed_active: true,
  //     description: "The NextMarket podcast features Michael Wolf's conversations with some of the biggest and most interesting names in tech, media and podcasting.",
  //     artwork: "http://www.launchpaddigitalmedia.com/images/podcast/300x300/NextMarket-Podcast-Logo-300-by-300.jpg",
  //     feed_checked_at: timestamp
  //   });

  //   var a16z_id = Shows.insert({
  //     name: "a16z Podcast",
  //     homepage: "http://a16z.com/tag/podcast/",
  //     feed: "http://feeds.soundcloud.com/users/soundcloud:users:62921190/sounds.rss",
  //     feed_active: true,
  //     description: "Podcast by a16z.",
  //     artwork: "https://i1.sndcdn.com/avatars-000073120599-46q7im-t500x500.jpg?77d7a69",
  //     feed_checked_at: timestamp
  //   });

  //   var atp_id = Shows.insert({
  //     name: "Accidental Tech Podcast",
  //     homepage: "http://atp.fm/",
  //     feed: "http://atp.fm/episodes?format=rss",
  //     feed_active: true,
  //     description: "Three nerds discussing tech, Apple, programming, and loosely related matters.",
  //     artwork: "http://a3.mzstatic.com/us/r30/Podcasts6/v4/45/be/74/45be745d-c0ce-ecc0-d27a-acecbd8b735d/mza_2368113117096256823.170x170-75.jpg",
  //     feed_checked_at: timestamp
  //   });

  //   var timferriss_ = Shows.insert({
  //     name: "The Tim Ferriss Show",
  //     homepage: "http://fourhourworkweek.com/category/the-tim-ferriss-show/",
  //     feed: "http://feeds.feedburner.com/thetimferrissshow",
  //     feed_active: true,
  //     description: "Tim Ferriss is a self-experimenter and bestselling author, best known for The 4-Hour Workweek, which has been translated into 40+ languages. Newsweek calls him 'the world's best human guinea pig', and The New York Times calls him 'a cross between Jack Welch and a Buddhist monk.' In this show, he deconstructs world-class performers from eclectic areas (investing, chess, pro sports, etc.), digging deep to find the tools, tactics, and tricks that listeners can use.",
  //     artwork: "http://fhww.files.wordpress.com/2014/04/timferrissshowart-500x500.jpg",
  //     feed_checked_at: timestamp
  //   });

  //   var foundation_id = Shows.insert({
  //     name: "Foundation",
  //     homepage: "http://foundation.bz/",
  //     feed: "http://gdata.youtube.com/feeds/base/users/kevinrose/uploads?format=5",
  //     feed_active: true,
  //     description: "Kevin Rose interviews entrepreneurs.",
  //     artwork: "http://jsndev.net/wp-content/uploads/2011/01/foundation-podcast.jpeg",
  //     feed_checked_at: timestamp
  //   });

  //   var randomshow_id = Shows.insert({
  //     name: "The Random Show",
  //     homepage: "http://fourhourworkweek.com/category/random/",
  //     feed: "http://www.squealingrat.org/random/feed/",
  //     feed_active: true,
  //     description: "A show hosted by Kevin Rose and Tim Ferriss, and edited by Glenn McElhose.",
  //     artwork: "http://a4.mzstatic.com/us/r30/Podcasts/v4/b5/1e/9b/b51e9bfe-5be5-288e-1e42-e5834b0078d0/mza_3104052315344185788.170x170-75.jpg",
  //     feed_checked_at: timestamp
  //   });

  // }

  // // EPISODES
  // if (Episodes.find().count() === 0) {
  //   var backtowork001 = make_episode(
  //     "audio", "mp3", "Back to Work 001",
  //     1, "c8b1b604524c39612ba0be3423ca4669",
  //     'back-to-work', "back-to-work-001", backtowork_id, [], [],
  //     [], [], false, null, 5368, timestamp, false, false,
  //     'Back to Work 001', 'http://5by5.tv/b2w/1',
  //     'Tue, 18 Jan 2011 20:00:00 GMT',
  //     "In the inaugural episode of Back to Work, Merlin Mann and Dan Benjamin discuss why they’re doing this show, getting back to work instead of buying berets, the lizard brain, and compare the Shadow of the Mouse to San Francisco, and eventually get to some practical tips for removing friction.",
  //     'http://5by5.tv/b2w/1',
  //     'http://d.5by5.net/redirect.mp3/cdn.5by5.tv/audio/broadcasts/b2w/2011/b2w-001.mp3'
  //   );

  //   var backtowork002 = make_episode(
  //     "audio", "mp3", "Back to Work 002",
  //     2, "118d07e7ac1adfdc6cd8b97400001a87",
  //     'back-to-work', 'back-to-work-002', backtowork_id, [], [],
  //     [], [], false, null, 4122, timestamp, false, false,
  //     'Back to Work 002', 'http://5by5.tv/b2w/2',
  //     'Tue, 25 Jan 2011 19:00:00 GMT',
  //     'Merlin Mann and Dan Benjamin formulate a five-minute warning tactic before discussing the reality of bringing change to your company, some patterns that work for startups, solving the right problem at the right level, why you can’t find the innovation button, and using PathFinder as a Finder replacement.',
  //     'http://5by5.tv/b2w/2',
  //     'http://d.5by5.net/redirect.mp3/cdn.5by5.tv/audio/broadcasts/b2w/2011/b2w-002.mp3'
  //   );

  //   var nerdist = make_episode(
  //     "audio", "mp3", "Moby",
  //     457, "bde5a8980a18df163c1f80618bdbd6d6",
  //     'nerdist', 'moby', nerdist_id, [], [],
  //     [], [], false, null, 4770, timestamp, false, false,
  //     'Moby', 'http://www.nerdist.com/2013/12/nerdist-podcast-moby/',
  //     'Mon, 23 Dec 2013 09:30:00 +0000',
  //     "Moby sits down with Chris and Jonah to talk about becoming sober (losing the 'sorry, I was super drunk' excuse), sampling, raves, inter-genre overlap in the music industry, L.A. architecture, partying, and a deep conversation about compartmentalizing and human cognition!",
  //     'd71f0ad3a64e97f085d7aaf19bbb0666',
  //     "http://www.podtrac.com/pts/redirect.mp3/traffic.libsyn.com/nerdist/Nerdist_457_-_Moby.mp3"
  //   );
  // }

  // // PEOPLE
  // if (People.find().count() === 0) {
  //   var merlin_mann = make_person(
  //     "merlin", "mann", "hotdogsladies", "http://www.merlinmann.com/", [backtowork001, backtowork002], [], true
  //   );

  //   var dan_benjamin = make_person(
  //     "dan", "benjamin", "danbenjamin", "http://benjamin.org/dan/", [backtowork001, backtowork002], [], true
  //   );

  //   var marc_maron = make_person(
  //     "marc", "maron", "marcmaron", "http://www.wtfpod.com/", [], [], true
  //   );

  //   var chris_hardwick = make_person(
  //     "chris", "hardwick", "nerdist", "http://nerdist.com", [nerdist], [], true
  //   );

  //   var joe_rogan = make_person(
  //     "joe", "rogan", "joerogan", "http://joerogan.net", [], [], true
  //   );

  //   var john_gruber = make_person(
  //     "john", "gruber", "gruber", "http://daringfireball.net/", [], [], true
  //   );

  //   var michael_wolf = make_person(
  //     "michael", "wolf", "michaelwolf", "http://about.me/wolf", [], [], true
  //   );

  //   var marco_arment = make_person(
  //     "marco", "arment", "marcoarment", "http://marco.org", [], [], true
  //   );

  //   var casey_liss = make_person(
  //     "casey", "liss", "caseyliss", "http://tumblr.caseyliss.com/", [], [], true
  //   );

  //   var john_siracusa = make_person(
  //     "john", "siracusa", "siracusa", "http://hypercritical.co/", [], [], true
  //   );

  //   var kevin_rose = make_person(
  //     "kevin", "rose", "kevinrose", "http://about.me/kevinrose", [], [], true
  //   );

  //   var tim_ferriss = make_person(
  //     "tim", "ferriss", "tferriss", "http://fourhourworkweek.com", [], [], true
  //   );
  // }

  // // COMPANIES

  // if (Companies.find().count() == 0) {
  //   var squarspace = make_company(
  //     "Squarespace", "http://squarespace.com", "squarespace"
  //   );
  // }

});
