// Episodes
// {
//   type: string,    // audio or video
//   format: string,   // encoding format: mp3, mp4, avi
//   title: string,  // if defined
//   number: number, // for podcast episode #s
//   storage_key: string,   // unique s3 key value
//   show_route: string,
//   show_id: string,
//   hosts: array of hosts,   // should include person_id
//   guests: array of guests, // should include person_id
//   edited: boolean,
//   postedited: boolean,
//   editor_id: string,
//   length_in_seconds: number,
//   created_at: date,
//   updated_at: date,
//   published: boolean,
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
  schema: {
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
      number: {
        type: Number,
        label: 'Episode Number'
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
        type: [Object],
        label: 'Hosts'
      },
      guests: {
        type: [Object],
        label: 'Guests'
      },
      edited: {
        type: Boolean,
        label: 'Edited flag'
      },
      postedited: {
        type: Boolean,
        label: 'Postedit flag'
      },
      editor_id: {
        type: String,
        label: 'Editor ID'
      },
      length_in_seconds: {
        type: Number,
        label: 'Length in seconds'
      },
      created_at: {
        type: Date,
        label: 'Created at'
      },
      updated_at: {
        type: Date,
        label: 'Updated at'
      },
      published: {
        type: Boolean,
        label: 'Published flag'
      },
      feed: {
        type: Object,
        label: 'Feed data (varying fields)'
      }
  }
});
