// Chapters
// {
//   title: string,
//   number: number,     // necessary?
//   episode_id: string,
//   editor_id: string,
//   start_time: number,
//   highlights: array of highlights,
//   next_chapter_id: string,
//   created_at: date,
//   updated_at: date
// }


Episodes = new Meteor.Collection('chapters', {
  schema: new SimpleSchema({
    title: {
      type: String,
      label: 'Title'
    },
    number: {
      type: Number,
      label: 'Number'
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
      type: [Object],
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
