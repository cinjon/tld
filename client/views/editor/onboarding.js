Template.on_boarding.helpers({
  signed_legal: function() {
    var user = Meteor.users.findOne({_id:Meteor.userId()}, {fields:{signed_editor_legal:true}});
    if (user) {
      return user.signed_editor_legal;
    }
  }
});
