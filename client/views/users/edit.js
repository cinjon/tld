Template.users_edit.edit_document = function () {
  return this;
};

Template.users_edit.helpers({
  userEditSchema: function () {
    return userSchema;
  }
});
