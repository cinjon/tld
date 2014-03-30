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
      return Highlights.find({episode_id:id});
    }
  },
  hosts: function() {
    var episode = get_episode_by_route_number(this.route, this.number);
    if (episode) {
      var hosts = episode.hosts || [];
      return People.find({_id:{$in:hosts}});
    }
  },
  new_input_time: function() {
    if (Session.get('player_loaded')) {
      return Session.get('highlight')['start_time'] || Session.get('player_time') || 0;
    }
    return 0;
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
  $('#highlight_times').css('padding-top', $('#header').outerHeight().toString() + 'px');
}

Template.editor_highlight.helpers({
  company: function() {
    return People.findOne({_id:this.company_id});
  },
  has_person: function() {
    return this.person_id != null;
  },
  has_link: function() {
    return this.url != null;
  },
  person: function() {
    return People.findOne({_id:this.person_id});
  },
  type_title: function() {
    if (this.person_id) {
      console.log(this.person_id);
      return People.findOne({_id:this.person_id}).first_name;
    } else if (this.company_id) {
      return Companies.findOne({_id:this.company_id}).name;
    } else if (this.type == "link") {
      return "Link";
    }
  }
});

Template.editor_new_input.created = function() {
  Session.set('highlight', new_highlight());
}

Template.editor_new_input.events({
  'change select': function(e, tmpl) {
    var val = $(e.target).val();
    if (!(val == 'instr')) {
      session_var_set_obj('highlight', ['type'], [val]);
      $('#select_type').hide();
      $('#speaker_name').css('display', 'table-cell');
      $('#speaker_type').show();
      $('#content_input_span').css('display', 'table-cell');
      $('#content_input_span').focus();
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
    if (e.shiftKey && val == '"' && e.keyCode == 222) {
      var type = Session.get('highlight')['type'];
      if (type && type == 'link') {
        $(e.target).val('');
      } else {
        set_highlight_type('italic');
      }
    } else if (e.keyCode == 13 && val != '') {
      set_highlight_finished(val, this.route, this.number, tmpl);
    }
  },
  'keyup #speaker_input': function(e, tmpl) {
    var val = $(e.target).val();
    if (e.keyCode == 13 && val != '') { //enter
      var type = Session.get('highlight')['type'];
      if (!type) { //new speaker, ask for what type
        set_highlight_speaker(val, null, null);
        $(tmpl.find('#typeahead_input')).hide();
        $(tmpl.find('#speaker_name')).css('display', 'table-cell');
        $(tmpl.find('#speaker_type')).show();
        $('#select_type').css('display', 'table-cell')
        $(tmpl.find('#content_input')).focus();
      }
    } else if (val == '' && !Session.get('highlight')['start_time']) {
      var time = Math.max(Session.get('player_time') - 5, 0)
      session_var_set_obj('highlight', ['start_time'], time);
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

Template.editor_new_input.rendered = function() {
  var datums_company = new Bloodhound({
  datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: get_selections_company()
  });

  var datums_people = new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: get_selections_people()
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

var get_selections_company = function() {
  console.log('g s c');
  console.log(Companies.find().fetch());
  return Companies.find({}, {fields:{name:true}}).map(function(company) {
    var name = company.name;
    console.log(name);
    return {value:name, id:company._id, type:'sponsor'}
  });
}

var get_selections_people = function() {
  console.log('g s ppp');
  console.log(People.find().fetch());
  return People.find({}, {fields:{first_name:true, last_name:true}}).map(function(person) {
    var name = person.first_name + ' ' + person.last_name;
    return {value:name, id:person._id, type:'person'};
  });
}

var get_episode_by_route_number = function(route, number) {
  return Episodes.findOne({show_route:route, number:number});
}

var new_highlight = function() {
  console.log('in new_highlight');
  //_speaker_name holds the name, e.g. "Matt Tanase" or "Link"
  return {type:null, editor_id:Meteor.userId(), episode_id:null,
          start_time:null, text:null, person_id:null,
          company_id:null, url:null, _speaker_name:null}
}

var set_css_new = function(tmpl) {
  if (tmpl) {
    $(tmpl.find('#typeahead_input')).show();
    $(tmpl.find('#speaker_name')).hide();
    $(tmpl.find('#content_input_span')).hide();
    $(tmpl.find('#speaker_col')).hide();
    $(tmpl.find('#speaker_input')).val('');
    $(tmpl.find('#speaker_input')).focus();
  } else {
    $('#typeahead_input').show();
    $('#speaker_name').hide();
    $('#content_input_span').hide();
    $('#speaker_col').hide();
    $('#speaker_input').val('');
    $('#speaker_input').focus();
  }
}

var set_highlight_finished = function(text, route, number, tmpl) {
  session_var_set_obj('highlight', ['text'], [text]);
  Meteor.call('new_highlight', Session.get('highlight'), route, number);
  Session.set('highlight', new_highlight());
  set_css_new(tmpl)
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
