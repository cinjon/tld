Meteor.startup(function() {
  if (Meteor.users.find().count() == 0) {
    var timestamp = (new Date()).getTime();

    var admin_id = Accounts.createUser({
      email:'admin@timelined.com',
      password:'fakeadmin',
      username:'Admin'
    });

    var editor_id = Accounts.createUser({
      email:'editor@fake.com',
      password:'fakeeditor',
      username:'Editor'
    });

    Roles.addUsersToRoles(editor_id, ['editor']);
    Roles.addUsersToRoles(admin_id, ['admin', 'editor']);
  }

  if (Shows.find().count() == 0) {
    var nextmarket_id = Shows.insert({
      name: 'NextMarket',
      homepage: 'http://nextmarket.co/pages/podcast',
      feed: null,
      description: "The NextMarket podcast features Michael Wolf's conversations with some of the biggest and most interesting names in tech, media and podcasting.",
      created_at: timestamp,
      artwork:null,
      route: make_name_route('NextMarket'),
    });

    var nextmarket_66_id = Episodes.insert({
      type: 'audio',
      format: 'mp3',
      title: 'Robert Scoble',
      number: 66,
      source_url: 'http://nextmarket.co/blogs/conversations/10454341-66-robert-scoble-on-google-glass-his-new-book-and-the-evolution-of-tech-blogging',
      source_note: null,
      storage_key: null,
      show_route: 'NextMarket',
      show_id: nextmarket_id,
      hosts: [],
      guests: [],
      edited: false,
      postedited: false,
      editor_id: null,
      length_in_seconds: 2962,
      created_at: timestamp,
      s3: 'http://s3timeliner.s3.amazonaws.com/nextmarket-podcast/66.mp3',
    });
  }
});