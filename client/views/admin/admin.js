Deps.autorun(function() {
  if (Roles.userIsInRole(Meteor.userId(), ['admin']) && Meteor.users.find().count() > 1) {
    set_user_typeahead();
  }
});

Template.admin.created = function() {
  Session.set('user_searched', null);
  Session.set('message', '');
}

Template.admin.destroyed = function() {
  Session.set('user_searched', null);
  Session.set('message', null);
}

Template.admin.helpers({
  color: function() {
    var part = Session.get('message').slice(0,1);
    if (part == 'S') { //*S*uccess
      return 'green';
    } else if (part == 'E') { //*E*rror
      return 'red';
    }
    return '';
  },
  has_signed_agreement: function() {
    var user = Session.get('user_searched');
    return user && Meteor.users.findOne({_id:user._id}, {signed_editor_legal:true}).signed_editor_legal;
  },
  has_user: function() {
    return Session.get('user_searched');
  },
  is_editor: function() {
    var user = Session.get('user_searched');
    if (user) {
      return Roles.userIsInRole(user._id, ['editor']);
    }
    return false;
  },
  is_editor_trial: function() {
    var user = Session.get('user_searched');
    if (user) {
      return Roles.userIsInRole(user._id, ['trial_editor']);
    }
    return false;
  },
  message: function() {
    return Session.get('message') || ''
  },
  username: function() {
    var user = Session.get('user_searched');
    if (user) {
      return user.username;
    }
    return '';
  },
})

Template.admin.events({
  'click #set_editor': function(e, tmpl) {
    var user = Session.get('user_searched');
    var name = user.username;
    if (!user) {
      Session.set('message', 'Error: Find a user pls');
      return;
    }

    var is_editor = Roles.userIsInRole(user._id, ['editor']);
    Meteor.call(
      'set_editor', user._id, is_editor,
      function(error, result) {
        if (!error) {
          if (is_editor) {
            Session.set('message', 'Success: ' + name + ' is now not an editor');
          } else {
            Session.set('message', 'Success: ' + name + ' is now an editor');
          }
        }
      }
    );
  },
  'click #set_editor_agreement': function(e, tmpl) {
    var user = Session.get('user_searched');
    var name = user.username;
    if (!user) {
      Session.set('message', 'Error: Find a user pls');
      return;
    }

    var has_agreed = user.signed_editor_legal;
    Meteor.call(
      'set_agree_to_terms', user._id, has_agreed,
      function(error, result) {
        if (!error) {
          if (has_agreed) {
            Session.set('message', 'Success: ' + name + ' revoked agreement');
          } else {
            Session.set('message', 'Success: ' + name + ' agreed');
          }
        }
      }
    );
  },
  'click #set_editor_trial': function(e, tmpl) {
    var user = Session.get('user_searched');
    var name = user.username;
    if (!user) {
      Session.set('message', 'Error: Find a user pls');
      return;
    }

    var is_editor = Roles.userIsInRole(user._id, ['trial_editor']);
    Meteor.call(
      'set_editor_trial', user._id, is_editor,
      function(error, result) {
        if (!error) {
          if (is_editor) {
            Session.set('message', 'Success: ' + name + ' is now not a trial editor');
          } else {
            Session.set('message', 'Success: ' + name + ' is now a trial editor');
          }
        }
      }
    );
  },
})

var set_user_typeahead = function() {
  var users = Meteor.users.find({}, {
    fields:{username:true}
  }).map(function(user) {
    return {value:user.username, id:user._id}
  });

  var datums = new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: users
  });
  datums.initialize();

  $('#search_users_field').typeahead(null, {
    displayKey: 'value',
    source: datums.ttAdapter()
  }).on('typeahead:selected', function(event, datum) {
    Session.set('user_searched', Meteor.users.findOne({_id:datum.id}));
  });
}
