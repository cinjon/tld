Template.home.created = function() {
  Session.set('show_chapters', null);
}

Template.home.rendered = function() {
  var search_count = People.find().count() + Shows.find().count();
  Session.set('home_search_count', search_count);
  Session.set('home_rendered', true);
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

var get_home_search_datums = function() {
  var data = [];

  People.find({}, {
    fields:{first_name:true, last_name:true}
  }, {
    reactive: false
  }).forEach(function(person) {
    var name = (person.first_name + ' ' + person.last_name).trim();
    data.push({value:name, type:'person', id:person._id});
  });

  Shows.find({}, {
    fields:{name:true}
  }, {
    reactive:false
  }).forEach(function(show) {
    data.push({value:show.name, type:'show', id:show._id})
  });

  return data;
}

var reset_home_search_typeahead = function() {
  $('#home_search_typeahead').typeahead('destroy', 'NoCached');
  set_home_search_typeahead();
}

var set_home_search_typeahead = function() {
  var datums = new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: get_home_search_datums()
  })

  datums.initialize();
  $('#home_search_typeahead').typeahead(
    {
      highlight: true
    },
    {
      displayKey: 'value',
      source: datums.ttAdapter(),
      limit: 5,
    }
  ).on('typeahead:selected', function(event, datum, name) {
    //TODO: bug here with this bieng called multiple times.
    console.log(datum);
  }).on('typeahead:autocompleted', function(event, datum, name) {
    console.log(datum);
  });
}

Deps.autorun(function() {
  if (Session.get('home_rendered') && Session.get('home_search_count') < People.find().count() + Shows.find().count()) {
    //TODO: Change to use 'equals' as seen in the meteor deps guide
    //We do this so that we can keep the search up to date as new episodes are added
    //A better way would be nice.
    Session.set('home_search_count', People.find().count() + Shows.find().count());
    reset_home_search_typeahead();
  }
});