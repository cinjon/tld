// Chapters
// {
//   title: string,
//   first: boolean,
//   episode_id: string,
//   editor_id: string,
//   start_time: number,
//   highlights: array of highlights,
//   next_chapter_id: string,
//   created_at: date,
//   updated_at: date
// }


Chapters = new Meteor.Collection('chapters', {
  schema: new SimpleSchema({
    title: {
      type: String,
      label: 'Title',
      optional: true
    },
    first: {
      type: Boolean,
      label: 'Is First Chapter'
    },
    episode_id: {
      type: String,
      label: 'Editor ID'
    },
    editor_id: {
      type: String,
      label: 'Editor ID'
    },
    start_time: {
      type: Number,
      label: 'Start time'
    },
    highlights: {
      type: [String],
      label: 'Highlights'
    },
    next_chapter_id: {
      type: String,
      label: 'Next Chapter ID',
      optional: true
    },
    created_at: {
      type: Date,
        autoValue: function() {
        if (this.isInsert) {
          return new Date;
        } else if (this.isUpsert) {
          return {$setOnInsert: new Date};
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
    }
  })
});

make_chapter = function(title, first, episode_id, editor_id,
                        start_time, highlights, next_chapter_id) {
  highlights = highlights || [];
  editor_id = editor_id || 'autogen'; //For making that first chapter
  return Chapters.insert(
    {title:title, editor_id:editor_id, first:first,
     episode_id:episode_id, start_time:start_time,
     highlights:highlights, next_chapter_id:next_chapter_id})
};
