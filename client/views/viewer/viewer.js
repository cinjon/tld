var viewer_reactivity = new ReactiveDict;

Template.viewer.created = function() {
  Session.set('current_chapter_cue', null);
  Session.set('current_chapter_time', null);
  Session.set('current_highlight_cue', null);
}

Template.viewer.helpers({
  chapters: function() {
    var episode = this.episode;
    if (episode) {
      var index = 0;
      return Chapters.find({episode_id:episode._id}, {
        reactive:false, sort:{start_time:1}
      }).map(function(chapter) {
        index += 1;
        chapter.index = index;
        return chapter;
      });
    }
  },
  episode_title: function() {
    var episode = this.episode;
    if (episode) {
      return episode.title;
    }
  },
  guests: function() {
    var episode = this.episode;
    if (!episode) {
      return [];
    }
    var guests = episode.guests || [];
    return People.find({_id:{$in:guests}}, {reactive:false}).map(function(person) {
      person.episode_id = episode._id;
      return person
    });
  },
  has_episode: function() {
    return this.episode;
  },
  hosts: function() {
    var episode = this.episode;
    if (!episode) {
      return [];
    }
    var hosts = episode.hosts || [];
    return People.find({_id:{$in:hosts}}, {reactive:false}).map(function(person) {
      person.episode_id = episode._id;
      return person;
    });
  },
  player_data: function() {
    return {
      storage_key: this.episode.storage_key,
      format: this.episode.format,
      type: this.episode.type,
      url: this.episode.feed.url,
      summary: this.episode.summary,
      seconds: this.seconds,
      play_on_load: this.play_on_load,
      highlights: Highlights.find({_id:{$in:this.episode.highlights}}, {
        fields:{start_time:true, chapter_id:true},
        reactive:false
      }).map(function(highlight) {
        var chapter = Chapters.findOne({_id:highlight.chapter_id});
        highlight.chapter_start_time = chapter.start_time;
        return highlight;
      }),
      chapters: Chapters.find({_id:{$in:this.episode.chapters}}, {
        fields:{start_time:true, title:true},
        reactive:false
      }),
      height: "360px"
    }
  },
});

Template.viewer_chapter.events({
  'click .chapter_inner': function(e, tmpl) {
    if ($(e.target).attr('class').indexOf('fa-share-square') == -1) {
      start_playing(this.start_time);
      // Session.set('current_chapter_cue', this._id);
      // Session.set('current_chapter_time', this.start_time);
      // Session.set('current_highlight_cue', this._id);
    }
  },
  'mouseleave .chapter_box': function(e, tmpl) {
    tmpl.$('.chapter_inner .fa').css('visibility', 'hidden');
  },
  'mouseenter .chapter_box': function(e, tmpl) {
    tmpl.$('.chapter_inner .fa').css('visibility', 'visible');
  },
});

Template.viewer_chapter.helpers({
  chapter_cue: function() {
    if (Session.equals('current_chapter_cue', this._id)) {
      return "chapter_cue";
    }
  },
  get_highlights_base_class: function(preview) {
    var current_chapter_time = Session.get('current_chapter_time');
    if (preview || !current_chapter_time || this.start_time >= current_chapter_time) {
      return "highlights-show";
    }
    return "highlights-none";
  },
  highlights: function() {
    var chapter_start_time = this.start_time;
    return Highlights.find({_id:{$in:this.highlights}}, {
      reactive:false, sort:{start_time:1}
    }).map(function(highlight) {
      highlight.chapter_start_time = chapter_start_time;
      return highlight;
    });
  },
  margin_top: function() {
    if (this.first) {
      return "margin-top:-10px";
    }
  },
});

Template.viewer_highlight.events({
  'click .highlight_text': function(e, tmpl) {
    if (Session.equals('player_ready', true)) {
      start_playing(Math.max(this.start_time - 1, 0)); //just before start_time so cuepoints takes effect.
    }
  },
  'click .set-bookmark': function() {
    Meteor.call('set_bookmark', Meteor.userId(), this._id);
  },
  'mouseleave .highlight-wrap': function(e, tmpl) {
    tmpl.$('.bookmark .fa').css('visibility', 'hidden');
  },
  'mouseenter .highlight-wrap': function(e, tmpl) {
    tmpl.$('.bookmark .fa').css('visibility', 'visible');
  }
})

Template.viewer_highlight.helpers({
  bookmark_class: function() {
    var bookmark = Bookmarks.findOne({user_id:Meteor.userId(), highlight_id:this._id});
    if (bookmark && !bookmark.deleted) {
      return "fa fa-bookmark mint_text set-bookmark";
    } else {
      return "fa fa-bookmark-o set-bookmark";
    }
  },
  bookmark_permanence: function() {
    var bookmark = Bookmarks.findOne({user_id:Meteor.userId(), highlight_id:this._id});
    if (bookmark && !bookmark.deleted) {
      return "-permanent";
    }
  },
  company: function() {
    var company = Companies.findOne({_id:this.company_id});
    company.type = 'company';
    return company;
  },
  has_person: function() {
    return this.person_id != null;
  },
  has_company: function() {
    return this.company_id != null;
  },
  has_link: function() {
    return this.type == 'link';
  },
  highlight_cue: function() {
    if (Session.get('current_highlight_cue') == this._id) {
      return "lemon";
    }
  },
  link: function() {
    return {type:'link'}
  },
  person: function() {
    var person = People.findOne({_id:this.person_id});
    person.type = 'person';
    return person;
  },
  type_title: function() {
    if (this.person_id) {
      var person = People.findOne({_id:this.person_id});
      if (person) {
        return person.first_name;
      }
    } else if (this.company_id) {
      var company = Companies.findOne({_id:this.company_id});
      if (company) {
        return company.name
      }
    } else if (this.type == "link") {
      return "Link";
    }
    return '';
  },
});