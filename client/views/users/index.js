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
                      return object.emails[0].address;
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
                      var destroy_url = "#";
                      return new Spacebars.SafeString("<a href="+destroy_url+">X</a>");
                     }
                  }
                ]
    };
  }
});
