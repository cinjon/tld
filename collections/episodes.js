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
Episodes = new Meteor.Collection('episodes');
