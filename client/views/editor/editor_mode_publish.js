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
          if (error) {
            Session.set('message', 'Error: Server error. Please try again.');
          } else {
            Session.set('message', 'Success: Summary set.');
          }
          target.blur();
        }
      );
    } else if (e.keyCode == 27) {
      target.blur();
      target.text(summary);
    }
  },
  'click #set_postedited_true': function(e, tmpl) {
    var episode_id = this._id;
    if (!this.postedited) {
      Meteor.call(
        'set_postedited_true', episode_id,
        function(error, result) {
          if (error) {
            Session.set('message', 'Error: Server error. Please try again.');
          } else if (result && result['success']) {
            Session.set('message', "Success: Thanks so much!.");
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
              text: "Thanks so much for completeing this.",
              html: ''
            });
          } else if (result && !result['success']) {
            Session.set('message', result['message']);
          }
        }
      )
    }
  }
});

Template.editor_mode_publish.helpers({
  btn_type: function() {
    if (this.postedited) {
      return "btn-default";
    } else {
      return "btn-primary";
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
  message: function() {
    return Session.get('message') || '';
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
        Session.set('message', validate[1]);
      }
    } else if (e.keyCode == 27) {
      e.preventDefault();
      Session.set('is_editing_name', null);
    }
  },
});

var publish_results = function(episode_id, user_id)  {
  var message = "";

  var chapters = Chapters.find({episode_id:episode_id}, {sort:{start_time:1}}).fetch();
  chapters.forEach(function(chapter) {
    message += "<p>" + chapter.title + "</p>"
    var highlights = Highlights.find({chapter_id:chapter_id}, {sort:{start_time:1}}).fetch();
    highlights.forEach(function(highlight) {
      message += "<p>" + highlight.text + "</p>";
      message += "<hr>";
    });
    message += "<hr>";
  });

  return message;
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