Template.shows_list.helpers({
  shows: function () {
    if (Session.get("search-query")) {
      return Shows.find({"name": Session.get("search-query")});
      // return Shows.find({ $text: { $search: Session.get("search-query") } });
    } else {
      return Shows.find();
    }
  }
});

Template.shows_list.events({
   'keyup #search-query': function (e) {
      Session.set("search-query", e.currentTarget.value);
    },
});
