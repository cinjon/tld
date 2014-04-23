var summary_placeholder = "Summarize the Episode";

Template.editor_mode_publish.events({
  'keydown #editor_summary': function(e, tmpl) {
    var target = tmpl.$(e.target);
    var val = target.text().trim();
    var summary = this.summary || summary_placeholder
    if (e.keyCode == 13) {
      e.preventDefault();
    }

    if (e.keyCode == 13 && val != '' && val != summary_placeholder) {
      Meteor.call(
        'set_episode_summary', this._id, val,
        function(error, result) {
          target.blur();
        }
      );
    } else if (e.keyCode == 27) {
      target.blur();
      target.text(summary);
    }
  },
  'click #set_postedited_true': function(e, tmpl) {
    var episode = this;
    var episode_id = episode._id;
    if (!episode.postedited && !is_editing_incomplete(episode)) {
      Meteor.call(
        'set_postedited_true', episode_id,
        function(error, result) {
          if (!error && result && result['success']) {
            Meteor.call('send_email', {
              to: 'admin@timelined.com',
              from: 'admin@timelined.com',
              subject: 'Episode submission from ' + Meteor.user().emails[0].address,
              text: "",
              html: publish_results(episode_id, Meteor.userId())
            });
            Meteor.call('send_email', {
              to: Meteor.user().emails[0].address,
              from: 'admin@timelined.com',
              subject: 'Editor Submission',
              text: "Thanks so much for completing this.",
              html: ''
            });
            $('#set_postedited_success_modal').modal({
              keyboard:true, show:true
            })
          } else if (result && !result['success']) {
            $('#set_postedited_failure_modal').modal({
              keyboard:true, show:true
            })
          }
        }
      )
    }
  }
});

Template.editor_mode_publish.helpers({
  disabled: function() {
    var episode = this;
    if (episode.postedited || is_editing_incomplete(episode)) {
      return "disabled";
    } else {
      return "";
    }
  },
  guests: function() {
    return People.find({_id:{$in:this.guests}, confirmed:false}, {
      fields:{first_name:true, last_name:true, avatar:true, twitter:true}
    });
  },
  hosts: function() {
    return People.find({_id:{$in:this.hosts}, confirmed:false}, {
      fields:{first_name:true, last_name:true, avatar:true, twitter:true}
    });
  },
  incomplete_summary: function() {
    if (!this.summary) {
      return "incomplete";
    }
  },
  summary: function() {
    return this.summary || summary_placeholder;
  }
});

Template.editable_profile.helpers({
  has_avatar: function() {
    return this.avatar && this.avatar != '';
  },
  is_editing_name: function() {
    return Session.get('is_editing_name') == this._id;
  },
  is_editing_twitter: function() {
    return Session.get('is_editing_twitter') == this._id;
  }
})

Template.editable_profile.events({
  'click .editable_profile': function(e, tmpl) {
    var classes = $(e.target).attr('class');
    if (classes.indexOf('name') > -1) {
      Session.set('is_editing_name', this._id);
      Session.set('is_editing_twitter', null);
    } else if (classes.indexOf('twitter') > -1) {
      Session.set('is_editing_twitter', this._id);
      Session.set('is_editing_name', null);
    }
  },
  'keyup #set_twitter': function(e, tmpl) {
    var input = $(e.target);
    var val = input.val().trim();
    if (e.keyCode == 13) {
      e.preventDefault();
      if (val != '') {
        Meteor.call('set_person_twitter', this._id, val);
        Session.set('is_editing_twitter', null);
      } else if (e.keyCode == 27) {
        e.preventDefault();
        Session.set('is_editing_twitter', null);
      }
    }
  },
  'keyup #set_name': function(e, tmpl) {
    var input = $(e.target);
    var val = input.val().trim();
    if (e.keyCode == 13) {
      e.preventDefault();
      var validate = validate_name(val);
      if (validate[0]) {
        Meteor.call('set_person_name', this._id, val);
        Session.set('is_editing_name', null);
      } else {
        //TODO: do a modal warning
      }
    } else if (e.keyCode == 27) {
      e.preventDefault();
      Session.set('is_editing_name', null);
    }
  },
});

Template.editor_stats.helpers({
  incomplete_chapters: function() {
    if (get_untitled_chapter_count() > 0) {
      return "incomplete";
    }
  },
  incomplete_people: function() {
    if (safe_length(this.guests) + safe_length(this.hosts) == 0) {
      return "incomplete";
    }
  },
  incomplete_title: function() {
    if (!this.title) {
      return "incomplete";
    }
  },
  incomplete_urls: function() {
    if (get_incomplete_links_count() > 0) {
      return "incomplete";
    }
  },
  num_incomplete_chapters: function() {
    return get_untitled_chapter_count();
  },
  num_incomplete_urls: function() {
    return get_incomplete_links_count();
  },
  num_chapters: function() {
    return safe_length(this.chapters);
  },
  num_guests: function() {
    return safe_length(this.guests);
  },
  num_hosts: function() {
    return safe_length(this.hosts);
  },
  num_people: function() {
    return safe_length(this.guests) + safe_length(this.hosts);
  },
  num_urls: function() {
    return Highlights.find({_id:{$in:this.highlights}, type:"link"}).count();
  },
  title: function() {
    return this.title || editor_title_placeholder;
  }
});

var is_editing_incomplete = function(episode) {
  return !episode.summary || !episode.title || (episode.hosts.length + episode.guests.length == 0) || get_incomplete_links_count() > 0 || get_untitled_chapter_count() > 0;
}

var publish_results = function(episode_id, user_id)  {
  var message = "";

  Chapters.find({episode_id:episode_id}, {sort:{start_time:1}}).forEach(function(chapter) {
    message += "<p>" + chapter.title + "</p>"
    var highlights =
    Highlights.find({chapter_id:chapter._id}, {sort:{start_time:1}}).forEach(function(highlight) {
      message += "<p>" + highlight.text + "</p>";
      message += "<hr>";
    });
    message += "<hr>";
  });

  return message;
}

var safe_length = function(arr) {
  if (arr) {
    return arr.length;
  }
  return 0;
}

var validate_name = function(name) {
  if (name == '') {
    return [false, "Please enter a name"];
  }
  var parts = name.split(' ');
  if (parts.length == 1) {
    return [false, "Please enter a first and last name"];
  } else if (parts.length > 2) {
    return [false, "Please enter only two names"];
  }
  return [true, null];
}