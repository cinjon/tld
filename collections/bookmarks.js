// Bookmarks
// {
//   highlight_id: string,
//   user_id: string,
//   deleted: boolean,
//   created_at: date,
//   updated_at: date
// }
Bookmarks = new Meteor.Collection('bookmarks', {
  schema: new SimpleSchema({
    highlight_id: {
      type: String,
      label: 'Highlight ID'
    },
    user_id: {
      type: String,
      label: 'User ID'
    },
    deleted: {
      type: Boolean,
      label: 'Bookmark is deleted',
      autoValue: function() {
        if (this.isSet) {
          return this.value;
        } else if (this.isInsert) {
          return false;
        }
      }
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
      }
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

make_bookmark = function(user_id, highlight_id) {
  return Bookmarks.insert({user_id:user_id, highlight_id:highlight_id});
}