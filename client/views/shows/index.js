Template.shows_list.helpers({
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
                  },
                  {
                    key: 'name',
                    label: 'Name',
                    fn: function (value, object) {
                      var url = "shows/" + object.route + "/edit";
                      return new Spacebars.SafeString("<a href="+url+">"+value+"</a>");
                    }
                  },
                  {
                    key: 'homepage',
                    label: 'Homepage'
                  },
                  {
                    key: 'feed_checked_at',
                    label: 'Feed Check',
                    fn: function (value) {
                      return new Date(value).toDateString('yyyy-MM-dd')
                    }
                  },
                  {
                    key: 'action',
                    label: 'Action',
                    fn: function (value, object) {
                      var episodes_url = object.route + "/episodes";
                      var destroy_url = "#";
                      return new Spacebars.SafeString("<a href="+episodes_url+">Episodes</a> | <a href="+destroy_url+">X</a>");
                     }
                  }
                ]
    };
  }
});
