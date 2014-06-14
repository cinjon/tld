var viewer_reactivity = new ReactiveDict;

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
      seconds: 0,
      highlights: Highlights.find({_id:{$in:this.episode.highlights}}, {
        fields:{start_time:true, chapter_id:true},
        reactive:false
      }).fetch(),
      chapters: Chapters.find({_id:{$in:this.episode.chapters}}, {
        fields:{start_time:true, title:true},
        reactive:false
      }),
      height: "360px"
    }
  },
});

Template.viewer_chapter.events({
  'mouseleave .chapter_box': function(e, tmpl) {
    tmpl.$('.chapter_inner .fa').css('visibility', 'hidden');
  },
  'mouseenter .chapter_box': function(e, tmpl) {
    tmpl.$('.chapter_inner .fa').css('visibility', 'visible');
  },
});

Template.viewer_chapter.helpers({
  highlights: function() {
    return Highlights.find({_id:{$in:this.highlights}}, {
      reactive:false, sort:{start_time:1}
    });
  },
  margin_top: function() {
    if (this.first) {
      return "margin-top:-10px";
    }
  },
});

Template.viewer_highlight.events({
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