Deps.autorun(function() {
  Meteor.subscribe('user_roles', Meteor.userId());
  Meteor.subscribe('editor_legal_agreement', Meteor.userId());
  Meteor.subscribe('trial_episodes', Meteor.userId());
  Meteor.subscribe('trial_shows', Meteor.userId());
});

Template.legal_agreement.events({
  'click #set_agree_to_terms': function(e, tmpl) {
    Meteor.call('set_agree_to_terms', Meteor.userId());
  }
});

Template.on_boarding.helpers({
  signed_legal: function() {
    var user = Meteor.users.findOne({_id:Meteor.userId()}, {fields:{signed_editor_legal:true}});
    if (user) {
      return user.signed_editor_legal;
    }
  },
  trial_data: function() {
    return {
      shows: Shows.find({
        _id: {
          $in: Episodes.find({
            trial:true, editor_id:Meteor.userId()
          }).map(
            function(episode) {
              return episode.show_id;
            }
          )
        }
      }).map(function(show) {
        show.trial = true;
        return show;
      })
    }
  }
});
