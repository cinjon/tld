var max_chapter_title_chars = 30;

Template.chapter_layout.events({
  'keydown .chapter_title': function(e, tmpl) {
    var title = tmpl.$('.chapter_title');
    var val = title.text().trim();
    if (e.keyCode == 13) {
      if (val && val != '') {
        Meteor.call('set_chapter_title', this._id, val)
      } else {
        title.text(this.title);
      }
      title.blur();
    } else if (e.keyCode == 27 || (e.keyCode == 8 && val=='')) {
      e.preventDefault();
      title.text(this.title);
      title.blur();
    } else if (val.length > max_chapter_title_chars && (e.keyCode != 8)) {
      e.preventDefault();
    }
  },
});

Template.chapter_layout.helpers({
  highlights: function() {
    return Highlights.find({_id:{$in:this.highlights}}, {sort:{start_time:1}});
  }
})

Template.editor_make_chapter.events({
  'click .row_text_time': function(e, tmpl) {
    Meteor.call(
      'new_chapter', this.chapter_id, this.start_time, Meteor.userId()
    );
  }
});

Template.editor_mode_review.helpers({
  chapters: function() {
    return Chapters.find({episode_id:this._id}, {sort:{start_time:1}});
  },
});
