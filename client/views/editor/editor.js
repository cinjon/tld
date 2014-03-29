Template.editor.created = function() {
  Session.set('highlight_typeahead_init', false)
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

Template.editor_highlight.helpers({
  highlight_is_quote_type: function() {
    return this.type == "quote";
  },
  speaker: function() {
    return People.findOne({_id:this.person_id});
  },
  type_title: function() {
    if (this.type == "quote") {
      return People.findOne({_id:this.person_id}).first_name;
    } else if (this.type == "link") {
      return "Link";
    } else {
      return "TODO";
    }
  }
});

Template.editor_new_input.created = function() {
  Session.set('highlight', new_highlight());
}

Template.editor_new_input.events({
  'keydown #content_input': function(e, tmpl) {
    if (e.keyCode == 8 && $(e.target).val() == '') {
      e.preventDefault();
      set_highlight_speaker(null);
      $(tmpl.find('#speaker_name')).hide();
      $(tmpl.find('#content_input_div')).hide();
      $(tmpl.find('#typeahead_input')).show();
      $(tmpl.find('#content_input')).val('');
      $(tmpl.find('#content_input')).focus();
      return;
    }
  },
  'keyup #content_input': function(e, tmpl) {
    var val = $(e.target).val();
    if (e.shiftKey && val == '' && e.keyCode == 222) {
      var type = Session.get('highlight')['type'];
      if (type && type == 'link') {
        $(e.target).val('');
      } else {
        set_highlight_type_to_quote();
      }
    } else if (e.keyCode == 13 && val != '') {
      set_highlight_finished(val, this.route, this.number);
    }
  },
  'keyup #speaker_input': function(e, tmpl) {
    var val = $(e.target).val();
    if (e.keyCode == 13 && val != '') { //enter
      var type = Session.get('highlight')['type'];
      if (!type) { //new speaker, ask for what type
        set_highlight_speaker(val, null, null);
        $(tmpl.find('#typeahead_input')).hide();
        $(tmpl.find('#speaker_name')).show();
        $('#select_type').css('display', 'inline-block')
        $(tmpl.find('#content_input')).focus();
      }
    }
  }
});

Template.editor_new_input.helpers({
  content: function() {
    return Session.get('highlight')['text'];
  },
  font_style: function() {
    var type = Session.get('highlight')['type'];
    if (type && type == 'quote') {
      return "font-style:'italic'";
    }
    return '';
  },
  has_speaker_src: function() {
    return false;
  },
  speaker_name: function() {
    return Session.get('highlight')['_speaker_name'];
  },
  speaker_type: function() {
    return Session.get('highlight')['type']
  }
});

Template.editor_select_type.events({
  'change select': function(e, tmpl) {
    var val = $(e.target).val();
    if (!(val == 'instr')) {
      session_var_set_obj('highlight', ['type'], [val]);
      $('#select_type').hide();
      $('#speaker_name').show();
      $('#content_input_div').css('display', 'block');
      $('#content_input_div').focus();
    }
  },
});

var get_selections_company = function() {
  return [{value:'blah', type:'sponsor'}, {value:'blew', type:'sponsor'}]
  return Companies.find({}, {fields:{name:true}}).map(function(company) {
    var name = company.name;
    return {value:name, id:company._id, type:'sponsor'}
  });
}

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
    $('#speaker_name').show();
    $('#typeahead_input').hide();
    $('#content_input_div').css('display', 'block');
    $('#content_input').focus();
  });
}

var get_selections_people = function() {
  return [{value:'pro', type:'person'}, {value:'plax read', type:'person'}]
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

var set_highlight_finished = function(text, route, number) {
  session_var_set_obj('highlight', ['text'], [text]);
  Meteor.call('new_highlight', Session.get('highlight'), route, number);
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

var set_highlight_type_to_quote = function() {
  session_var_set_obj('highlight', ['type'], ['quote']);
}
