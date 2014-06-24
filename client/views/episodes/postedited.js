Template.episodes_postedited.events({
  'click .reactive-table tr': function (e, tmpl) {
    if ($(e.target).attr('class') == 'toggle_published_episode') {
      Meteor.call('set_published_episode', this._id, !this.published);
    }
  }
});

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
          key: 'published',
          label: 'Published?',
          sort: 'ascending',
          fn: function(value, object) {
            return new Spacebars.SafeString("<a class=toggle_published_episode>" + value + "</a>");
          }
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
