var home_reactivity = new ReactiveDict;

Template.home.created = function() {
  home_reactivity.set('show_chapters', null);
  home_reactivity.set('home_display', 'recent');
}

Template.home.rendered = function() {
  var search_count = People.find().count() + Shows.find().count();
  home_reactivity.set('home_search_count', search_count);
  home_reactivity.set('home_rendered', true);
}

Template.home.helpers({
  episodes: function() {
    return Episodes.find({published:true});
  },
  has_subscriptions: function() {
    //TODO: implement subscriptions for user.
    return true;
  },
  header_you: function() {
    return get_header_info('you');
  },
  header_popular: function() {
    return get_header_info('popular');
  },
  header_recent: function() {
    return get_header_info('recent');
  },
});

Template.home_episode.events({
  'click .oplay_episode': function(e, tmpl) {
    //Play this episode;
  },
  'click .show_button': function(e, tmpl) {
    if (home_reactivity.equals('show_chapters', this._id)) {
      home_reactivity.set('show_chapters', null);
    } else {
      home_reactivity.set('show_chapters', this._id);
    }
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
  num_chapters: function() {
    return this.chapters.length;
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
  show_chapters_class: function() {
    var css_class = "fa fa-comment-o fa-stack-2x";
    if (home_reactivity.equals('show_chapters', this._id)) {
      return css_class + " active";
    } else {
      return css_class;
    }
  },
  show_title: function() {
    var show = Shows.findOne({_id:this.show_id});
    if (show) {
      return show.name;
    } else {
      return 'Mystery Show';
    }
  },
})

Template.home_header_box.events({
  'click button': function(e, tmpl) {
    home_reactivity.set('home_display', this.key);
  }
});

Template.home_header_box.helpers({
  box_info: function() {
    return {
      key: this.key,
      title: this.title,
      num_reviews: null
    }
  },
  is_home_display: function(key) {
    return home_reactivity.equals('home_display', this.key);
  }
});

var get_header_box_image = function(key) {
  //TODO: implement with images
  return 'PIC';
}

var get_header_info = function(key) {
  return {
    key: key,
    title: capitalize(key),
    image: get_header_box_image(key),
  }
}

var get_home_search_shows = function() {
  return Shows.find({}, {
    fields:{name:true}
  }, {
    reactive:false
  }).map(function(show) {
    return {value:show.name, type:'show', id:show._id}
  })
}

var get_home_search_people = function() {
  return People.find({}, {
    fields:{first_name:true, last_name:true}
  }, {
    reactive: false
  }).map(function(person) {
    var name = (capitalize(person.first_name) + ' ' + capitalize(person.last_name)).trim();
    return {value:name, type:'person', id:person._id};
  });
}

var reset_home_search_typeahead = function() {
  $('#home_search_typeahead').typeahead('destroy', 'NoCached');
  set_home_search_typeahead();
}

var set_home_search_typeahead = function() {
  var people_datums = new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: get_home_search_people()
  })

  var show_datums = new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: get_home_search_shows()
  })

  people_datums.initialize();
  show_datums.initialize();

  $('#home_search_typeahead').typeahead(
    {
      highlight: true
    },
    {
      displayKey: 'value',
      source: show_datums.ttAdapter(),
      limit: 3,
      templates: {
        header: '<div class="tt-header">Shows</div>'
      }
    },
    {
      displayKey: 'value',
      source: people_datums.ttAdapter(),
      limit: 3,
      templates: {
        header: '<div class="tt-header">People</div>',
      }
    }
  ).on('typeahead:selected', function(event, datum, name) {
    //TODO: bug here with this bieng called multiple times.
    console.log(datum);
  }).on('typeahead:autocompleted', function(event, datum, name) {
    console.log(datum);
  });
}

Deps.autorun(function() {
  if (home_reactivity.equals('home_rendered', true) && home_reactivity.get('home_search_count') < People.find().count() + Shows.find().count()) {
    //We do this so that we can keep the search up to date as new episodes are added
    //A better way would be nice.
    home_reactivity.set('home_search_count', People.find().count() + Shows.find().count());
    reset_home_search_typeahead();
  }
});