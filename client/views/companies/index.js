Template.companies_list.helpers({
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
                    key: 'name',
                    label: 'Name',
                    fn: function (value, object) {
                      var edit_url = "/companies/" + object._id + "/edit";
                      return new Spacebars.SafeString("<a href="+edit_url+">"+value+"</a>")
                    }
                  },
                  {
                    key: 'homepage',
                    label: 'Homepage'
                  },
                  {
                    key: 'twitter',
                    label: 'Twitter'
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
