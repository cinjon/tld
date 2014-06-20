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
          key: 'toggleEditor',
          label: 'Toggle Editorship',
          fn: function (value, object) {
            return new Spacebars.SafeString("<a id='toggle_editorship' href='#'>Toggle Editorship</a>");
          }
        },
        {
          key: 'toggleAlpha',
          label: 'Toggle Alpha',
          fn: function (value, object) {
            return new Spacebars.SafeString("<a id='toggle_alpha' href='#'>Toggle Alpha</a>");
          }
        }
      ]
    };
  }
});

Template.users_list.events({
  'click .reactive-table tr': function (e, tmpl) {
    if (e.target.id == "toggle_editorship") {
      Meteor.call("set_editor", this._id, Roles.userIsInRole(this._id, ['editor']));
    } else if (e.target.id == "toggle_alpha") {
      Meteor.call("set_alpha", this._id, Roles.userIsInRole(this._id, ['alpha']));
    };
  }
});
