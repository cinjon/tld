var max_chars = 140;

Template.add_person.events({
  'click button': function(e, tmpl) {
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
      var episode_id = Session.get('episode_id');
      Meteor.call(
        'new_' + this.id, val, episode_id, function(err, result) {
          destroy_typeaheads();
          toggle_add_person(true, type);
          set_speaker_typeahead();
          set_people_typeahead();
        }
      );
    }
  },
});

Template.character_cutoff.helpers({
  current_char_counter: function() {
    return Session.get('current_char_counter');
  },
  current_notes_color: function() {
    if (Session.get('current_char_counter') > max_chars) {
      return '#EB1E2C';
    } else {
      return '#000000';
    }
  },
  max_chars: function() {
    return max_chars;
  }
});

Template.editor.created = function() {
  Session.set('init_typeahead', false);
  Session.set('mode', 'draft');
  Session.set('current_char_counter', 0);
}

Template.editor.destroyed = function() {
  Session.set('current_char_counter', null);
}

Template.editor.events({
  'click .remove_person': function(e, tmpl) {
    var type = $(e.target).closest('a').attr('type');
    var episode_id = Session.get('episode_id');
    var person_id = this._id;
    Meteor.call(
      'remove_' + type, episode_id, person_id,
      function(error, result) {
        destroy_typeaheads();
        set_speaker_typeahead();
        set_people_typeahead();
      }
    );
  }
});

Template.editor.helpers({
  add_guest: function() {
    return {
      id:'guest',
    }
  },
  add_host: function() {
    return {
      id:'host',
    }
  },
  episode_title: function() {
    var episode = Episodes.findOne({_id:Session.get('episode_id')});
    if (episode) {
      return episode.title;
    }
  },
  guests: function() {
    var episode = Episodes.findOne({_id:Session.get('episode_id')});
    if (!episode) {
      return [];
    }
    var guests = episode.guests || [];
    return People.find({_id:{$in:guests}});
  },
  has_episode: function() {
    return Session.get('episode_id');
    var episode = Episodes.findOne({_id:Session.get('episode_id')});
  },
  header_review: function() {
    return {
      color:'#E6A861',
      key:'review',
      title:'Review'
    }
  },
  header_draft: function() {
    return {
      color:'#df5445',
      key:'draft',
      title:'Draft'
    }
  },
  header_publish: function() {
    return {
      color:'#00FF7F',
      key:'publish',
      title:'Publish'
    }
  },
  highlights: function() {
    return Highlights.find({episode_id:Session.get('episode_id')}, {sort:{start_time:-1}});
  },
  hosts: function() {
    var episode = Episodes.findOne({_id:Session.get('episode_id')});
    if (!episode) {
      return [];
    }
    var hosts = episode.hosts || [];
    return People.find({_id:{$in:hosts}});
  },
  new_time: function() {
    var time = 0;
    if (Session.get('player_loaded')) {
      time = Session.get('highlight')['start_time'] || Math.max(Session.get('player_time') - 5, 0) || 0;
    }
    return {start_time:time, new_time:true}
  },
  player_data: function() {
    var episode = Episodes.findOne({_id:Session.get('episode_id')});
    if (episode) {
      return {
        storage_key: episode.storage_key,
        format: episode.format,
        type: episode.type
      }
    }
  },
  show_title: function() {
    var show = Shows.findOne({route:this.route});
    if (show) {
      return show.name;
    }
  },
});

Template.editor.rendered = function() {
  Session.set('episode', this.data);
  $('#highlight_times').css(
    'padding-top',
    (parseInt($('#header').css('margin-bottom')) + $('#header').outerHeight()).toString() + 'px'
  );
  Session.set('editor_rendered', true);
}

Template.editor_header_box.events({
  'click button': function(e, tmpl) {
    Session.set('mode', this.key);
  }
});

Template.editor_header_box.helpers({
  is_editor_mode: function() {
    return this.key == Session.get('mode');
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
        return company.name;
      }
    } else if (this.type == "link") {
      return "Link";
    }
  }
});

Template.editor_highlight.rendered = function() {
  if (this.data.type == "quote") {
    this.$('.highlight_text').css('font-style', 'italic');
    this.data.text = '"' + this.data.text + '"';
  }

  var text = this.data.text;
  var char_slice = 57;
  var row_width = this.$('.row').width();
  var highlight_image_width = this.$('.highlight_image').outerWidth();
  var highlight_type_width = this.$('.highlight_type').outerWidth();
  var highlight_content_width = this.$('.highlight_content').width();
  var available_width = row_width - highlight_image_width - highlight_type_width;
  while(highlight_content_width > available_width) {
    text = text.slice(0,char_slice) + '...'
    if (text.slice(0,1) == '"') {
      text += '"'
    }
    this.$('.highlight_content').text(text);
    highlight_content_width = this.$('.highlight_content').width();
    char_slice -= 3;
  }
}

Template.editor_highlight_time.events({
  'click .edit_time': function(e, tmpl) {
    $('.edit_text_time').hide();
    $(tmpl.find('.plain_text_time')).hide();
    $(tmpl.find('.edit_text_time')).show();
  },
  'keydown .edit_text_time': function(e, tmpl) {
    var val = $(e.target).val();
    if (e.keyCode == 8 && val == '') {
      e.preventDefault();
      $(tmpl.find('.plain_text_time')).show();
      $(tmpl.find('.edit_text_time')).hide();
    }
  },
  'keyup .edit_text_time': function(e, tmpl) {
    if (e.keyCode == 13) {
      var val = validate_time($(e.target).val(), this.start_time);
      if (val) {
        Meteor.call('set_start_time', this._id, val)
      }
      $(tmpl.find('.plain_text_time')).show();
      $(tmpl.find('.edit_text_time')).hide();
    }
  }
});

Template.editor_highlight_time.helpers({
  edit_time: function() {
    if (!this.new_time) {
      return "edit_time";
    } else {
      return "";
    }
  }
});

Template.editor_new_input.created = function() {
  Session.set('highlight', new_highlight());
}

Template.editor_new_input.events({
  'keydown #content_input': function(e, tmpl) {
    var val = $(e.target).val();
    if (e.keyCode == 8 && val == '') {
      e.preventDefault();
      set_highlight_type('normal');
      set_highlight_speaker(null);
      set_css_new(tmpl);
      return;
    } else if (e.keyCode == 8 && val == '"') {
      e.preventDefault();
      set_highlight_type('note');
      $(e.target).val('');
    }
  },
  'keyup #content_input': function(e, tmpl) {
    var val = $(e.target).val().trim();
    Session.set('current_char_counter', val.length);

    if (e.shiftKey && val == '"' && e.keyCode == 222) {
      var type = Session.get('highlight')['type'];
      if (type && type == 'link') {
        $(e.target).val('');
      } else {
        set_highlight_type('italic');
      }
    } else if (e.keyCode == 13 && val != '' && Session.get('current_char_counter') <= max_chars) {
      set_highlight_finished(val, Session.get('episode_id'), tmpl);
    }
  },
  'keyup #speaker_input': function(e, tmpl) {
    var val = $(e.target).val().trim();
    if (e.keyCode == 13 && val != '') { //enter
      var type = Session.get('highlight')['type'];
      if (!type) { //new company
        set_highlight_speaker(val, 'sponsor', null);
        tmpl.$('#typeahead_input').hide();
        tmpl.$('#speaker_input').val('');
        tmpl.$('#speaker_name').css('display', 'table-cell');
        tmpl.$('#speaker_type').show();
        tmpl.$('#content_input_span').css('display', 'table-cell');
        tmpl.$('#content_input').focus();
      }
    } else if (val.length == 1 && !Session.get('highlight')['start_time']) {
      var time = Math.max(Session.get('player_time') - 5, 0)
      session_var_set_obj('highlight', ['start_time'], [time]);
    } else if (val == '' && Session.get('highlight')['start_time']) {
      session_var_set_obj('highlight', ['start_time'], [null]);
    }
  }
});

Template.editor_new_input.helpers({
  content: function() {
    return Session.get('highlight')['text'];
  },
  has_speaker_src: function() {
    return false;
  },
  is_speaker_set: function() {
    var vals = Session.get('highlight');
    return vals['_speaker_name'] != null && vals['type'] != null;
  },
  speaker_name: function() {
    return Session.get('highlight')['_speaker_name'];
  },
  speaker_type: function() {
    return Session.get('highlight')['type']
  }
});

Template.small_picture.helpers({
  is_link: function() {
    return this.type == 'link'
  }
});

var count_text_chars = function(text) {
  if (typeof text == "undefined" || !text) {
    return 0;
  }
  return text.text().length;
};

var destroy_typeaheads = function() {
  $('#speaker_input').typeahead('destroy','NoCached')
  $('#new_person_input_guest').typeahead('destroy','NoCached');
  $('#new_person_input_host').typeahead('destroy','NoCached');
};

var get_selections_company = function() {
  return Companies.find({}, {fields:{name:true}}).map(function(company) {
    var name = company.name;
    return {value:name, id:company._id, type:'sponsor'}
  });
}

var get_selections_people = function() {
  var episode_id = Session.get('episode_id');
  return People.find({
    $or:[{hosts:episode_id}, {guests:episode_id}]
  }, {
    fields:{first_name:true, last_name:true}
  }).map(
    function(person) {
      var name = person.first_name + ' ' + person.last_name;
      return {value:name, id:person._id, type:'person'};
    }
  );
}

var get_all_people = function() {
  //Would be great if we ddin't have to do this crap below to dedupe
  //Problem at the moment is with meteor not accepting $nin
  var episode = Episodes.findOne({_id:Session.get('episode_id')});
  var guests = [];
  var hosts = [];
  if (episode) {
    var guests = episode.guests || guests;
    var hosts = episode.hosts || hosts;
  }
  var map = [];
  People.find(
    {}, {fields:{first_name:true, last_name:true}}).forEach(
      function(person) {
        if (hosts.indexOf(person._id) == -1 && guests.indexOf(person._id) == -1) {
          var name = person.first_name + ' ' + person.last_name;
          map.push({value:name, id:person._id, type:'person'});
        }
      }
    );
  return map;
}

var new_highlight = function() {
  //_speaker_name holds the name, e.g. "Matt Tanase" or "Link"
  return {type:null, editor_id:Meteor.userId(), episode_id:null,
          start_time:null, text:null, person_id:null,
          company_id:null, url:null, _speaker_name:null}
}

var set_css_new = function(tmpl) {
  if (tmpl) {
    tmpl.$('#typeahead_input').show();
    tmpl.$('#speaker_name').hide();
    tmpl.$('#content_input').val('');
    Session.set('current_char_counter', 0);
    tmpl.$('#content_input_span').hide();
    tmpl.$('#speaker_input').val('');
    tmpl.$('#speaker_input').focus();
  }
}

var set_episode = function(episode_data) {
  if (!episode_data) {
    return;
  }
  route = episode_data['route'];
  number = episode_data['number'];
  if (!route || !number) {
    return;
  }
  var episode = Episodes.findOne({show_route:route, number:number});
  if (!episode) {
    return;
  }
  Session.set('episode_id', episode._id);
  Session.set('episode', null);
}

var set_highlight_finished = function(text, episode_id, tmpl) {
  session_var_set_obj('highlight', ['text', 'episode_id'], [text, episode_id]);
  var highlight = Session.get('highlight');
  Meteor.call(
    'add_highlight', highlight,
    function(error, result) {
      if (highlight['_speaker_name'] && !highlight['company_id'] && !highlight['person_id']) {
        $('#speaker_input').typeahead('destroy','NoCached');
        set_speaker_typeahead();
      }
      Session.set('highlight', new_highlight());
      set_css_new(tmpl);
    }
  );
}

var set_highlight_speaker = function(name, type, id) {
  //link, note, sponsor
  var _t = _c_id = _p_id = _name = null;
  if (name == null) {
    //do nothing;
  } else if (type == 'link') { //typed in link
    _t = 'link';
    _name = 'Link'
  } else if (type == 'sponsor') { //typed in company
    _t = 'sponsor'
    _c_id = id;
    _name = name;
  } else if (type == 'person') {  //typed in person
    _t = 'note'
    _p_id = id;
    _name = name
  } else {
    _name = name
  }
  session_var_set_obj(
    'highlight',
    ['type', 'company_id', 'person_id', '_speaker_name'],
    [_t, _c_id, _p_id, _name]
  );
}

var set_highlight_type = function(style) {
  if (style == 'italic') {
    session_var_set_obj('highlight', ['type'], ['quote']);
  } else if (style == 'note') {
    session_var_set_obj('highlight', ['type'], ['note']);
    style = 'normal';
  }
  $('#content_input').css('font-style', style);
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
      'add_' + type, Session.get('episode_id'), datum.id,
      function(error, result) {
        destroy_typeaheads();
        toggle_add_person(true, type);
        set_speaker_typeahead();
        set_people_typeahead();
      }
    );
  })
}

var set_people_typeahead = function() {
  var data = get_all_people();
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

var set_speaker_typeahead = function() {
  var data_people = get_selections_people();
  if (data_people.length > 0) {
    Session.set('init_typeahead', true);
  } else {
    return;
  }

  var datums_people = new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: data_people
  });

  var data_companies = get_selections_company();
  var datums_company = new Bloodhound({
  datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: data_companies
  });

  var datums_link = new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: [{value:'Link', id:null, type:'link'}]
  });

  datums_company.initialize();
  datums_people.initialize();
  datums_link.initialize();

  $('#speaker_input').typeahead(
    {
      highlight: true
    },
    {
      displayKey: 'value',
      source: datums_company.ttAdapter(),
      limit: 5,
      templates: {
        header: '<h3>Companies</h3>'
      }
    },
    {
      displayKey: 'value',
      source: datums_people.ttAdapter(),
      limit: 5,
      templates: {
        header: '<h3>People</h3>'
      }
    },
    {
      displayKey: 'value',
      source: datums_link.ttAdapter(),
      limit: 1,
      templates: {
          header: '<h3>Link</h3>'
      }
    }
  ).on('typeahead:selected', function(event, datum, name) {
    set_highlight_speaker(datum.value, datum.type, datum.id);
    $('#speaker_name').css('display', 'table-cell');
    $('#speaker_type').show();
    $('#typeahead_input').hide();
    $('#content_input_span').css('display', 'table-cell');
    $('#content_input').focus();
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

var validate_time = function(new_time_string, old_time_secs) {
  var new_time_secs = format_clock_to_seconds(new_time_string);
  //include a check for it to be less than the duration of the video
  if (new_time_secs && new_time_secs != old_time_secs && new_time_secs < player_duration()) {
    return new_time_secs;
  } else {
    return false;
  }
}

Deps.autorun(function() {
  var episode = Session.get('episode');
  var episode_id = Session.get('episode_id');
  var rendered = Session.get('editor_rendered');
  var init_typeaheads = Session.get('init_typeahead');
  if (rendered && episode && !episode_id) {
    set_episode(episode);
  } else if (rendered && !episode && episode_id && !init_typeaheads) {
    set_people_typeahead();
    set_speaker_typeahead();
  }
});