Template.episodes_list.helpers({
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
                      var edit_url = "/" + object.show_route + "/episodes/" + object._id + "/edit";
                      return new Spacebars.SafeString("<a href="+edit_url+">"+value+"</a>");
                    }
                  },
                  {
                    key: 'number',
                    label: "Number"
                  },
                  {
                    key: 'show_route',
                    label: 'Show'
                  },
                  {
                    key: 'storage_key',
                    label: 'S3 Key'
                  },
                  {
                    key: 'published',
                    label: 'Published?'
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
