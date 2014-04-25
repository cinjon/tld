// Episodes
// {
//   type: string,    // audio or video
//   format: string,   // encoding format: mp3, mp4, avi
//   title: string,  // if defined
//   route: string, // url slug
//   number: number, // for podcast episode #s
//   storage_key: string,   // unique s3 key value
//   show_route: string,
//   show_id: string,
//   hosts: array of hosts,   // should include person_id
//   guests: array of guests, // should include person_id
//   chapters: array of chapters,
//   highlights: array of highlights,
//   postedited: boolean,
//   editor_id: string,
//   length_in_seconds: number,
//   created_at: date,
//   updated_at: date,
//   published: boolean,
//   summary: string,
//   trial: boolean,
//   feed:
    // data from rss feed, this can vary depending on how much info is provided
    // these 6 are fairly standard
    // {
    //   title:
    //   url:
    //   published:
    //   summary:
    //   entry_id:
    //   enclosure_url
    // }
// }

Episodes = new Meteor.Collection('episodes', {
  schema: new SimpleSchema({
    type: {
      type: String,
      label: 'Type (audio or video)',
    },
    format: {
      type: String,
      label: 'Encoding Format'
    },
    title: {
      type: String,
      label: 'Title'
    },
    route: {
      type: String,
      label: 'Route',
      autoValue: function() {
        var title_field = this.field('title');
        if (title_field.isSet) {
          var count = Episodes.find({title:title_field.value}).count();
          return make_name_route(title_field.value, count);
        }
      }
    },
    number: {
      type: Number,
      label: 'Episode Number',
      optional: true
    },
    storage_key: {
      type: String,
      label: 'S3 storage key'
    },
    show_route: {
      type: String,
      label: 'Show Route'
    },
    show_id: {
      type: String,
      label: 'Show ID'
    },
    hosts: {
      type: [String],
      label: 'Hosts',
      optional: true
    },
    guests: {
      type: [String],
      label: 'Guests',
      optional: true
    },
    chapters: {
      type: [String],
      label: 'Chapters',
      optional: true
    },
    highlights: {
      type: [String],
      label: 'Highlights',
      optional: true
    },
    postedited: {
      type: Boolean,
      label: 'Postedit flag',
      autoValue: function() {
        if (this.isSet) {
          return this.value;
        } else if (this.isInsert || this.isUpdate) {
          return false;
        }
      }
    },
    editor_id: {
      type: String,
      label: 'Editor ID',
      optional: true
    },
    length_in_seconds: {
      type: Number,
      label: 'Length in seconds',
      optional: true
    },
    created_at: {
      type: Date,
      autoValue: function() {
        if (this.isInsert) {
          return new Date();
        } else if (this.isUpsert) {
          return {$setOnInsert: new Date()};
        } else {
          this.unset();
        }
      },
      denyUpdate: true
    },
    updated_at: {
      type: Date,
      autoValue: function() {
        if (this.isUpdate) {
          return new Date();
        }
      },
      denyInsert: true,
      optional: true
    },
    published: {
      type: Boolean,
      label: 'Published flag'
    },
    trial: {
      type: Boolean
    },
    summary: {
      type: String,
      autoValue: function() {
        if (this.isInsert) {
          return null;
        }
      },
      optional: true
    },
    feed: {
      type: Object,
      label: 'Feed data (varying fields)',
      blackbox: true
    }
  })
});

make_episode = function(type, format, title, number, storage_key,
                        show_route, show_id, hosts, guests,
                        chapters, highlights, postedited,
                        editor_id, length_in_seconds, created_at,
                        published, trial, feed_title, feed_url, feed_published,
                        feed_summary, feed_entry_id, feed_enclosure_url) {
  created_at = created_at || (new Date()).getTime();
  chapters = chapters || [];
  highlights = highlights || [];
  guests = guests || [];
  hosts = hosts || [];
  var episode_id = Episodes.insert(
    {type:type, format:format, title:title, number:number,
     storage_key:storage_key, show_route:show_route, show_id:show_id,
     hosts:hosts, guests:guests, chapters:chapters, highlights:highlights,
     postedited:postedited, editor_id:editor_id,
     length_in_seconds:length_in_seconds, created_at:created_at,
     published:published, trial:trial,
     feed: {
       url:feed_url, title:feed_title, published:feed_published,
       summary:feed_summary, entry_id:feed_entry_id,
       enclosure_url:feed_enclosure_url
      }
    }
  );
  if (chapters.length == 0) {
    var chapter_id = make_chapter(
      'Introduction', true, episode_id, editor_id, 0, highlights, null);
    Episodes.update({_id:episode_id}, {$addToSet:{chapters:chapter_id}});
  }
};

make_trial_episode = function(storage_key, editor_id) {
  if (!editor_id) {
    return;
  }

  if (Meteor.server) {
    var episode = Episodes.findOne({storage_key:storage_key});
    delete episode['_id'];
    delete episode['created_at'];
    delete episode['updated_at'];
    delete episode['edited'];
    episode.trial = true;
    episode.postedited = false;
    episode.chapters = [];
    episode.highlights = [];
    episode.guests = [];
    episode.editor_id = editor_id;
    episode.number = episode.number || -1; //if it's not in there, then it's set to null;

    var episode_id = Episodes.insert(episode);
    var chapter_id = make_chapter(
      'Introduction', true, episode_id, editor_id, 0, [], null);
    People.update({_id:{$in:episode.hosts}}, {$addToSet:{hosts:episode_id}}, {multi:true});
    Episodes.update({_id:episode_id}, {$addToSet:{chapters:chapter_id}});
  }
  return episode_id
};

Episodes.allow({
  insert: function () {
    return Roles.userIsInRole(Meteor.userId(), ['admin']);
  },
  remove: function () {
    return Roles.userIsInRole(Meteor.userId(), ['admin']);
  },
  update: function () {
    return Roles.userIsInRole(Meteor.userId(), ['admin']);
  }
});
