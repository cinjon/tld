Template.episodes_postedited.helpers({
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
                    key: 'title',
                    label: 'Title',
                    fn: function (value, object) {
                      var edit_url = "/episodes/" + object.route + "/edit";
                      return new Spacebars.SafeString("<a href="+edit_url+">"+value+"</a>");
                    }
                  },
                  {
                    key: 'show_route',
                    label: 'Show'
                  },
                  {
                    key: 'postedited',
                    label: 'Postedited?'
                  },
                  {
                    key: 'published',
                    label: 'Published?'
                  },
                  {
                    key: 'editor_id',
                    label: 'Editor ID',
                    fn: function (value, object) {
                      var user_url = "/users/" + value + "/edit";
                      if (value) {
                        return new Spacebars.SafeString("<a href="+user_url+">"+value+"</a>")
                      } else {
                        return "";
                      }
                    }
                  }
                ]
    };
  }
});
