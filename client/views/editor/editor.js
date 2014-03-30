var max_chars = 140;

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
  Session.set('current_char_counter', 0);
}

Template.editor.destroyed = function() {
  Session.set('current_char_counter', null);
}

Template.editor.helpers({
  episode_title: function() {
    var episode = get_episode_by_route_number(this.route, this.number);
    if (episode) {
      return episode.title;
    }
  },
  guests: function() {
    var episode = get_episode_by_route_number(this.route, this.number);
    if (episode) {
      var guests = episode.guests || [];
      return People.find({_id:{$in:guests}});
    }
  },
  has_episode: function() {
    return get_episode_by_route_number(this.route, this.number) != null;
  },
  highlights: function() {
    var episode = get_episode_by_route_number(this.route, this.number);
    if (episode) {
      var id  = episode._id
      return Highlights.find({episode_id:id}, {sort:{start_time:-1}});
    }
  },
  hosts: function() {
    var episode = get_episode_by_route_number(this.route, this.number);
    if (episode) {
      var hosts = episode.hosts || [];
      return People.find({_id:{$in:hosts}});
    }
  },
  new_time: function() {
    var time = 0;
    if (Session.get('player_loaded')) {
      time = Session.get('highlight')['start_time'] || Math.max(Session.get('player_time') - 5, 0) || 0;
    }
    return {start_time:time}
  },
  show_title: function() {
    var show = Shows.findOne({route:this.route});
    if (show) {
      return show.name;
    }
  },
  player_data: function() {
    var episode = get_episode_by_route_number(this.route, this.number);
    if (episode) {
      return {
        storage_key: episode.storage_key,
        format: episode.format,
        type: episode.type
      }
    }
  }
});

Template.editor.rendered = function() {
  $('#highlight_times').css(
    'padding-top',
    (parseInt($('#header').css('margin-bottom')) + $('#header').outerHeight()).toString() + 'px'
  );
  Session.set('editor_rendered', true);
}

Template.editor.destroyed = function() {
  Session.set('editor_rendered', null);
}

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

Template.editor_new_input.created = function() {
  Session.set('highlight', new_highlight());
}

Template.editor_new_input.events({
  'change select': function(e, tmpl) {
    var val = $(e.target).val();
    if (!(val == 'instr')) {
      session_var_set_obj('highlight', ['type'], [val]);
      tmpl.$('#select_type').hide();
      tmpl.$('#speaker_name').css('display', 'table-cell');
      tmpl.$('#speaker_type').show();
      tmpl.$('#content_input_span').css('display', 'table-cell');
      tmpl.$('#content_input_span').focus();
    }
  },
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
    var val = $(e.target).val();
    Session.set('current_char_counter', val.length);

    if (e.shiftKey && val == '"' && e.keyCode == 222) {
      var type = Session.get('highlight')['type'];
      if (type && type == 'link') {
        $(e.target).val('');
      } else {
        set_highlight_type('italic');
      }
    } else if (e.keyCode == 13 && val != '' && Session.get('current_char_counter') <= max_chars) {
      set_highlight_finished(val, this.route, this.number, tmpl);
    }
  },
  'keyup #speaker_input': function(e, tmpl) {
    var val = $(e.target).val();
    if (e.keyCode == 13 && val != '') { //enter
      var type = Session.get('highlight')['type'];
      if (!type) { //new speaker, ask for what type
        set_highlight_speaker(val, null, null);
        tmpl.$('#typeahead_input').hide();
        tmpl.$('#speaker_name').css('display', 'table-cell');
        tmpl.$('#speaker_type').show();
        tmpl.$('#select_type').css('display', 'table-cell')
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

var get_selections_company = function() {
  return Companies.find({}, {fields:{name:true}}).map(function(company) {
    var name = company.name;
    return {value:name, id:company._id, type:'sponsor'}
  });
}

var get_selections_people = function() {
  return People.find({}, {fields:{first_name:true, last_name:true}}).map(function(person) {
    var name = person.first_name + ' ' + person.last_name;
    return {value:name, id:person._id, type:'person'};
  });
}

var get_episode_by_route_number = function(route, number) {
  return Episodes.findOne({show_route:route, number:number});
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
    tmpl.$('#speaker_col').hide();
    tmpl.$('#speaker_input').val('');
    tmpl.$('#speaker_input').focus();
  }
}

var set_highlight_finished = function(text, route, number, tmpl) {
  session_var_set_obj('highlight', ['text'], [text]);
  Meteor.call('new_highlight', Session.get('highlight'), route, number);
  Session.set('highlight', new_highlight());
  set_css_new(tmpl);
  $('#speaker_input').typeahead('destroy','NoCached')
  set_speaker_typeahead();
  $('#speaker_input').focus();
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

var set_speaker_typeahead = function() {
  var data_companies = get_selections_company();
  var data_people = get_selections_people();
  if (data_people.length > 0 || data_companies.length > 0) {
    Session.set('init_typeahead_editor', true);
  } else {
    return;
  }

  var datums_company = new Bloodhound({
  datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: data_companies
  });

  var datums_people = new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: data_people
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

Deps.autorun(function() {
  if (Session.get('editor_rendered') && !Session.get('init_typeahead_editor')) {
    set_speaker_typeahead();
  }
});
