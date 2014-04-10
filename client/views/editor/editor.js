Template.add_person.events({
  'click button': function(e, tmpl) {
    if (!Session.get('init_typeaheads')) {
      reset_typeaheads(this.episode_id);
    }
    toggle_add_person(false, this.id)
  },
  'keydown .new_person_input': function(e, tmpl) {
    var val = $(e.target).val();
    if (e.keyCode == 8 && val == '') {
      e.preventDefault();
      toggle_add_person(true, this.id);
    }
  },
  'keyup .new_person_input': function(e, tmpl) {
    var val = $(e.target).val().trim();
    var type = this.id;
    if (e.keyCode == 13 && val != '') {
      var episode_id = this.episode_id;
      Meteor.call(
        'new_' + this.id, val, episode_id, function(err, result) {
          reset_typeaheads(episode_id);
          toggle_add_person(true, type);
        }
      );
    }
  },
});

Template.editor.created = function() {
  Session.set('init_typeaheads', false);
  Session.set('editor_mode', 'draft');
  Session.set('current_char_counter', 0);
}

Template.editor.destroyed = function() {
  Session.set('current_char_counter', null);
}

Template.editor.events({
  'click .remove_person': function(e, tmpl) {
    var type = $(e.target).closest('a').attr('type');
    var episode_id = this.episode_id
    var person_id = this._id;
    Meteor.call(
      'remove_' + type, episode_id, person_id,
      function(error, result) {
        reset_typeaheads(episode_id);
      }
    );
  }
});

Template.editor.helpers({
  add_guest: function() {
    if (this.episode) {
      return {
        id:'guest',
        episode_id:this.episode._id
      }
    }
  },
  add_host: function() {
    if (this.episode) {
      return {
        id:'host',
        episode_id:this.episode._id
      }
    }
  },
  episode_data: function() {
    if (this.episode) {
      return {
        storage_key: this.episode.storage_key,
        format: this.episode.format,
        type: this.episode.type
      }
    }
  },
  episode_title: function() {
    var episode = this.episode;
    if (episode) {
      return episode.title;
    }
  },
  guests: function() {
    var episode = this.episode;
    if (!episode) {
      return [];
    }
    var guests = episode.guests || [];
    return People.find({_id:{$in:guests}}).map(function(person) {
      person.episode_id = episode._id;
      return person
    });
  },
  has_episode: function() {
    return this.episode;
  },
  header_review: function() {
    return {
      color_class:'mint',
      key:'review',
      title:'Review'
    }
  },
  header_draft: function() {
    return {
      color_class:"coral",
      key:'draft',
      title:'Draft'
    }
  },
  header_publish: function() {
    return {
      color_class:'tangerine',
      key:'publish',
      title:'Publish'
    }
  },
  hosts: function() {
    var episode = this.episode;
    if (!episode) {
      return [];
    }
    var hosts = episode.hosts || [];
    return People.find({_id:{$in:hosts}}).map(function(person) {
      person.episode_id = episode._id;
      return person;
    });
  },
  show_title: function() {
    if (this.show) {
      return this.show.title;
    }
  },
});

Template.editor.rendered = function() {
  Session.set('editor_rendered', true);
}

Template.editor_header_box.events({
  'click button': function(e, tmpl) {
    Session.set('editor_mode', this.key);
  }
});

Template.editor_highlight.events({
  'click .remove_highlight': function() {
    Meteor.call('remove_highlight', this._id);
  }
});

Template.editor_highlight.helpers({
  company: function() {
    return People.findOne({_id:this.company_id});
  },
  has_person: function() {
    return this.person_id != null;
  },
  has_company: function() {
    return this.company_id != null;
  },
  has_link: function() {
    return this.url != null;
  },
  link: function() {
    return {type:'link'}
  },
  padding_top: function() {
    if (is_editor_mode('review')) {
      return "padding-top:5px"
    }
  },
  person: function() {
    return People.findOne({_id:this.person_id});
  },
  type_title: function() {
    if (this.person_id) {
      var person = People.findOne({_id:this.person_id});
      if (person) {
        return person.first_name;
      }
    } else if (this.company_id) {
      var company = Companies.findOne({_id:this.company_id});
      if (company) {
        return company.name
      }
    } else if (this.type == "link") {
      return "Link";
    }
    return '';
  }
});

Template.editor_highlight.rendered = function() {
  if (this.data.type == "quote") {
    this.$('.highlight_text').css('font-style', 'italic');
    this.data.text = '"' + this.data.text + '"';
  }

  // var text = this.data.text;
  // var char_slice = 57;
  // var row_width = this.$('.row').width();
  // var highlight_image_width = this.$('.highlight_image').outerWidth();
  // var highlight_type_width = this.$('.highlight_type').outerWidth();
  // var highlight_content_width = this.$('.highlight_content').width();
  // var available_width = row_width - highlight_image_width - highlight_type_width;
  // while(highlight_content_width > available_width) {
  //   text = text.slice(0,char_slice) + '...'
  //   if (text.slice(0,1) == '"') {
  //     text += '"'
  //   }
  //   this.$('.highlight_content').text(text);
  //   highlight_content_width = this.$('.highlight_content').width();
  //   char_slice -= 3;
  // }
}

Template.small_person_display.helpers({
  has_twitter: function() {
    return this.twitter && this.twitter != '';
  },
  name: function() {
    return this.first_name + ' ' + this.last_name;
  }
});

Template.small_picture.helpers({
  is_link: function() {
    return this.type == 'link'
  }
});

var destroy_typeaheads = function() {
  $('#speaker_input').typeahead('destroy','NoCached')
  $('#sponsor_input').typeahead('destroy','NoCached')
  $('#new_person_input_guest').typeahead('destroy','NoCached');
  $('#new_person_input_host').typeahead('destroy','NoCached');
};

var get_all_people = function(episode_id) {
  //Would be great if we ddin't have to do this crap below to dedupe
  //Problem at the moment is with meteor not accepting $nin
  var episode = Episodes.findOne({_id:episode_id});
  var guests = [];
  var hosts = [];
  if (episode) {
    var guests = episode.guests || guests;
    var hosts = episode.hosts || hosts;
  }
  var map = [];
  People.find(
    {}, {fields:{first_name:true, last_name:true}, reactive:false}).forEach(
      function(person) {
        if (hosts.indexOf(person._id) == -1 && guests.indexOf(person._id) == -1) {
          var name = person.first_name + ' ' + person.last_name;
          map.push({value:name, id:person._id, type:'person', episode_id:episode_id});
        }
      }
    );
  return map;
}

var get_selections_people = function(episode_id) {
  return People.find({
    $or:[{hosts:episode_id}, {guests:episode_id}]
  }, {
    fields:{first_name:true, last_name:true}, reactive:false
  }).map(
    function(person) {
      var name = person.first_name + ' ' + person.last_name;
      return {value:name, id:person._id, type:'person', episode_id:episode_id};
    }
  );
}

reset_typeaheads = function(episode_id) {
  destroy_typeaheads();
  if (episode_id) {
    set_speaker_typeahead(episode_id);
    set_people_typeahead(episode_id);
  }
  set_sponsor_typeahead();
  if (!Session.get('init_typeaheads')) {
    Session.set('init_typeaheads', true);
  }
}

var _set_people_typeahead = function(type, datums) {
  $('#new_person_input_' + type).typeahead(
    {
      highlight: true
    },
    {
      displayKey: 'value',
      source: datums.ttAdapter(),
      limit: 5,
    }
  ).on('typeahead:selected', function(event, datum, name) {
    Meteor.call(
      'add_' + type, datum.episode_id, datum.id,
      function(error, result) {
        toggle_add_person(true, type);
        reset_typeaheads(datum.episode_id);
      }
    );
  })
}

var set_people_typeahead = function(episode_id) {
  var data = get_all_people(episode_id);
  if (data.length == 0) {
    return;
  }
  var datums = new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: data
  });
  datums.initialize();

  _set_people_typeahead('guest', datums);
  _set_people_typeahead('host', datums);
}

var set_speaker_typeahead = function(episode_id) {
  //TODO: bug here because if there are no hosts or guests, then this always rfails --> destroy_typeaheads throws error.
  //Either way this is terrible and should be fixed.
  var data_people = get_selections_people(episode_id);
  var datums_people = new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: data_people
  });
  datums_people.initialize();

  $('#speaker_input').typeahead(
    {
      highlight: true
    },
    {
      displayKey: 'value',
      source: datums_people.ttAdapter(),
      limit: 5,
      templates: {
        header: '<h3>People</h3>'
      }
    }
  ).on('typeahead:selected', function(event, datum, name) {
    do_typeahead_type_of_highlight(datum);
  });
}

var toggle_add_person = function(button, type) {
  if (button) {
    $('#add_' + type + '_button').show();
    $('#new_person_input_span_' + type).hide();
    $('#new_person_input_' + type).val('');
  } else {
    $('#add_' + type + '_button').hide();
    $('#new_person_input_span_' + type).show();
    $('#new_person_input_' + type).focus();
  }
}
