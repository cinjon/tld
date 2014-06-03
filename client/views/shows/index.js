Template.shows_list.helpers({
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
                    fn: function (value, object) {
                      var edit_url = "shows/" + object.route + "/edit";
                      return new Spacebars.SafeString("<a href="+edit_url+">"+value+"</a>");
                    }
                  },
                  {
                    key: 'homepage',
                    label: 'Homepage'
                  },
                  {
                    key: 'feed_checked_at',
                    label: 'Feed Check',
                    fn: function (value, object) {
                      if (object.feed_active) {
                        return new Date(value).toDateString('yyyy-MM-dd');
                      } else {
                        return "Inactive";
                      }
                    }
                  },
                  {
                    key: 'action',
                    label: 'Action',
                    fn: function (value, object) {
                      var episodes_url = object.route + "/episodes";
                      return new Spacebars.SafeString("<a href="+episodes_url+">Episodes</a>");
                     }
                  }
                ]
    };
  }
});
