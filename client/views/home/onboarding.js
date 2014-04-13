Deps.autorun(function() {
  Meteor.subscribe('user_roles', Meteor.userId());
  Meteor.subscribe('editor_legal_agreement', Meteor.userId());
});

Template.on_boarding.helpers({
  signed_legal: function() {
    var user = Meteor.users.findOne({_id:Meteor.userId()}, {fields:{signed_editor_legal:true}});
    if (user) {
      return user.signed_editor_legal;
    }
  },
  trial_data: function() {
    var show_ids = Episodes.find({
      postedited: false,
      trial: true
    }).map(function(episode) {
      return episode.show_id;
    });
    return {
      shows: _.uniq(
        Shows.find({
          _id: {
            $in: show_ids
          }
        }).map(function(show) {
          show.trial = true;
          return show;
        })
      )
    }
  }
});
