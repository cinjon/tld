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
      seconds: 0,
      highlights: Highlights.find({_id:{$in:this.episode.highlights}}, {
        fields:{start_time:true, chapter_id:true},
        reactive:false
      }).fetch(),
      chapters: Chapters.find({_id:{$in:this.episode.chapters}}, {
        fields:{start_time:true, title:true},
        reactive:false
      })
    }
  },
});

Template.viewer_chapter.helpers({
  cue_color: function() {
    if (Session.get('current_highlight_cue') == this._id) {
      return 'lemon';
    }
  },
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

Template.viewer_highlight.helpers({
  company: function() {
    var company = Companies.findOne({_id:this.company_id});
    company.type = 'company';
    return company;
  },
  cue_color: function() {
    if (Session.get('current_highlight_cue') == this._id) {
      return 'lemon';
    }
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

Template.viewer_marker.helpers({
  display: function() {
    if (Session.get('current_highlight_cue') == this._id) {
      return "display:block";
    } else {
      return "display:none";
    }
  }
});
