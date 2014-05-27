Template.people_list.helpers({
  settings: function () {
    return {
        rowsPerPage: 30,
        showFilter: true,
        useFontAwesome: true,
        showNavigation: 'auto',
        fields: [
                  {
                    key: 'name',
                    label: 'Name',
                    fn: function (vlaue, object) {
                      var edit_url = "/people/" + object._id + "/edit";
                      var name = object.first_name + " " + object.last_name;
                      return new Spacebars.SafeString("<a href="+edit_url+">"+name+"</a>")
                    }
                  },
                  {
                    key: 'twitter',
                    label: 'Twitter'
                  },
                  {
                    key: 'homepage',
                    label: 'Homepage'
                  },
                  {
                    key: 'confirmed',
                    label: 'Confirmed?'
                  }
                ]
    };
  }
});
