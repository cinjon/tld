// Highlights
// {
//   type: string,      // quote, link, sponsor or note
//   editor_id: string,
//   episode_id: string,
//   start_time: number,
//   text: string,         // the quotation, link text or note
//   person_id: string,    // only if note or quote
//   company_id: string,   // only if a sponsor
//   url: url,             // only if a link
//   created_at: date,
//   updated_at: date
// }
Highlights = new Meteor.Collection('highlights', {
  schema: {
    type: {
      type: String,
      label: 'Type'
    },
    editor_id: {
      type: String,
      label: 'Editor ID'
    },
    episode_id: {
      type: String,
      label: 'Editor ID'
    },
    start_time: {
      type: String,
      label: 'Start Time'
    },
    text: {
      type: String,
      label: 'Text'
    },
    person_id: {
      type: String,
      label: 'Person ID',
      optional: true
    },
    company_id: {
      type: String,
      label: 'Company ID',
      optional: true
    },
    url: {
      type: String,
      label: 'URL',
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
  }
});








make_highlight = function(type, editor_id, episode_id, start_time, text,
                          person_id, company_id, url, created_at) {
  created_at = created_at || (new Date()).getTime();
  return Highlights.insert({type:type, editor_id:editor_id, episode_id:episode_id,
                            start_time:start_time, text:text, person_id:person_id,
                            company_id:company_id, url:url,
                            created_at:created_at});
};
