var max_chapter_title_chars = 60;

Template.chapter_layout.events({
  'click .remove_chapter': function(e, tmpl) {
    if (!this.first) { //Don't let editors squash the first chapter.
      var highlights = this.highlights;
      Meteor.call('remove_chapter', this._id);
    }
  },
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
  editing_content_class: function() {
    if (Session.get('is_editing_highlight_content') == this._id) {
      return 'is-editing';
    }
  },
  chapter_title_class: function() {
    if (!this.title) {
      return "red_text";
    }
  },
  highlights: function() {
    var highlights = this.highlights;
    var index = 1;
    return Highlights.find({_id:{$in:highlights}}, {sort:{start_time:1}}).map(function(highlight) {
      highlight.is_review = true; //For showing timestamp instead of remove button
      highlight.last = (index == highlights.length); //For not letting chapters get created after this
      index += 1;
      return highlight;
    });
  },
  title: function() {
    return this.title || "Title this Chapter"
  }
})

Template.editor_make_chapter.events({
  'mouseover .row_text_time .chapter_divider': function(e, tmpl) {
    var elem = $(e.currentTarget);
    // only add tooltip once
    if (!elem.hasClass("tooltip-active")) {
      elem.addClass("tooltip-active");
      elem.tooltip({
        placement: "right",
        trigger: "hover"
      });
      elem.tooltip("show");
    }
  },
  'click .row_text_time': function(e, tmpl) {
    var tooltip_elem = $(e.currentTarget).find('.chapter_divider');
    if (tooltip_elem.hasClass("tooltip-active")) {
      tooltip_elem.tooltip("destroy");
      tooltip_elem.removeClass("tooltip-active");
    }
    Meteor.call(
      'new_chapter', this.chapter_id, this.start_time, Meteor.userId()
    )
  }
});

Template.editor_mode_review.helpers({
  chapters: function() {
    return Chapters.find({episode_id:this._id}, {sort:{start_time:1}});
  },
});
