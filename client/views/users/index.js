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
                    label: 'ID',
                    fn: function (value) {
                      var edit_url = "/users/" + value + "/edit";
                      return new Spacebars.SafeString("<a href="+edit_url+">"+value+"</a>")
                    }
                  },
                  {
                    key: 'username',
                    label: 'Username'
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
