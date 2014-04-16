Template.editor_mode_publish.helpers({
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
    return this.summary || "Summarize the Episode";
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
  }
});

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