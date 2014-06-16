Template.users_list.helpers({
  settings: function () {
    return {
        rowsPerPage: 30,
        showFilter: true,
        useFontAwesome: true,
        showNavigation: 'auto',
        fields: [
                  {
                    key: '_id',
                    label: 'ID'
                  },
                  {
                    key: 'username',
                    label: 'Username',
                    fn: function (value, object) {
                      var edit_url = "/users/" + object._id + "/edit";
                      return new Spacebars.SafeString("<a href="+edit_url+">"+value+"</a>")
                    }
                  },
                  {
                    key: 'emails',
                    label: 'Email',
                    fn: function (value, object) {
                      return object.emails[0].address || "";
                    }
                  },
                  {
                    key: 'roles',
                    label: 'Roles'
                  },
                  {
                    key: 'action',
                    label: 'Action',
                    fn: function (value, object) {
                      return new Spacebars.SafeString("<a id='toggle_editorship' href='#'>Toggle Editorship</a>");
                     }
                  }
                ]
    };
  }
});

Template.users_list.events({
  'click .reactive-table tr': function (e, tmpl) {
    if (e.target.id == "toggle_editorship") {
      if (Roles.userIsInRole(this._id, ['editor'])) {
        Meteor.call("unset_editor", this._id, true);
      } else {
          Meteor.call("set_editor", this._id, false);
      };
    };
  }
});
