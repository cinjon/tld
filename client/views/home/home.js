Template.home.created = function() {
  Session.set('show_chapters', null);
}

Template.home.helpers({
  episodes: function() {
    return Episodes.find({published:true});
  }
});

Template.home_episode.events({
  'click #play_episode': function(e, tmpl) {
    //Play this episode;
  },
  'click #show_chapters': function(e, tmpl) {
    Session.set('show_chapters', this._id);
  }
});

Template.home_episode.helpers({
  episode_title: function() {
    var title = this.title;
    var show = Shows.findOne({_id:this.show_id});
    if (show && title.slice(0, show.name.length) == show.name) {
      return title.slice(show.name.length).trim();
    } else {
      return title;
    }
  },
  people: function() {
    return People.find({
      $or:[{_id:{$in:this.hosts}}, {_id:{$in:this.guests}}]
    }, {
      fields:{first_name:true, last_name:true},
    });
  },
  published_date: function() {
    return this.feed.published;
  },
  show_title: function() {
    var show = Shows.findOne({_id:this.show_id});
    if (show) {
      return show.name;
    } else {
      return 'Mystery Show';
    }
  },
  toggle_direction: function() {
    if (Session.get('show_chapters') == this._id) {
      return "down";
    } else {
      return "right";
    }
  },
})
