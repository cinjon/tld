Template.editor_highlight_time.events({
  'click .edit_time': function(e, tmpl) {
    set_css_time(null, true);
    set_css_time(tmpl, false);
  },
  'keydown .edit_text_time': function(e, tmpl) {
    var val = $(e.target).val();
    if (e.keyCode == 8 && val == '') {
      set_css_time(tmpl, true);
    }
  },
  'keyup .edit_text_time, blur .edit_text_time': function(e, tmpl) {
    if (e.keyCode == 13) {
      var val = validate_time($(e.target).val(), this.start_time);
      if (val) {
        Meteor.call('set_start_time', this._id, val)
      }
      set_css_time(tmpl, true);
    } else if (e.type == "focusout") {
      set_css_time(tmpl, true);
    }
  },
});

Template.editor_highlight_time.helpers({
  edit_time: function() {
    if (!this.new_time) {
      return "edit_time";
    }
    return "new_time";
  }
});

Template.editor_mode_draft.helpers({
  episode_id: function() {
    if (this._id) {
      Session.set('episode_id_for_search', this._id);
    }
    return {
      episode_id:this._id
    }
  },
  highlights: function() {
    return Highlights.find({episode_id:this._id}, {sort:{start_time:-1}});
  },
  new_time: function() {
    var time = 0;
    if (Session.get('player_loaded')) {
      var highlight = Session.get('highlight');
      if (!highlight) {
        Session.set('highlight', new_highlight());
      }
      time = Session.get('highlight')['start_time'] || Math.max(Session.get('player_time') - 5, 0) || 0;
    }
    return {start_time:time, new_time:true}
  },
});

Template.editor_new_input.created = function() {
  Session.set('highlight', new_highlight());
}

Template.editor_new_input.destroyed = function() {
  Session.set('editor_new_input_rendered', false);
}

Template.editor_new_input.events({
  'keydown #content_input': function(e, tmpl) {
    var val = tmpl.$(e.target).text();
    if (e.keyCode == 13) { //To remove the flickering on the content add.
      e.preventDefault();
    } else if (e.keyCode == 8 && val == '') {
      set_highlight_type('normal');
      set_highlight_speaker(null);
      set_css_new();
    }
  },
  'keyup #content_input': function(e, tmpl) {
    do_content_input(e, true, tmpl, Session.get('highlight'));
  },
  'keyup #speaker_input': function(e, tmpl) {
    if ($(e.target).val().trim() == '#') {
      session_var_set_obj(
        'highlight', ['type', '_speaker_name'], ['link', 'Link']
      )
      show_content_input();
      set_start_time(true);
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
  highlight_cutoff: function() {
    return {
      char_counter_id: 'highlight_cutoff'
    }
  },
  speaker_name: function() {
    return Session.get('highlight')['_speaker_name'];
  },
});

Template.editor_new_input.rendered = function() {
  Session.set('editor_new_input_rendered', true);
}

do_content_input = function(e, is_editing, tmpl, highlight) {
  var input = $(e.target);
  var val = input.text().trim();
  var length = val.length;
  editor_reactivity.set('highlight_cutoff', length);

  if (length > MAX_CHARACTERS['highlight_cutoff']) { //Check for it being way too long
    e.preventDefault();
  } else if (e.shiftKey && e.keyCode == 222 && highlight.type == 'note' && val.slice(0,1) == '"') { //Quote in beginning
    if (is_editing) {
      set_highlight_type('italic');
    } else {
      Meteor.call(
        'set_highlight_type', highlight._id, 'quote',
        function(error, result) {
          Session.set('is_editing_highlight_content', false);
        }
      )
    }
  } else if (e.keyCode == 13 && val != '' && length <= MAX_CHARACTERS['highlight_cutoff']) { //Complete highlight
    if (is_editing && tmpl) {
      set_highlight_finished(val, tmpl.data.episode_id, tmpl);
    } else if (!is_editing) {
      Meteor.call(
        'set_highlight_text', highlight._id, val,
        function(error, result) {
          Session.set('is_editing_highlight_content', false);
        }
      );
    }
  } else if (!is_editing && e.keyCode == 27) { //escape key on review mode input
    Session.set('is_editing_highlight_content', false);
  } else if (highlight.type == 'quote' && val.slice(0,1) != '"') {
    if (is_editing) {
      set_highlight_type('normal');
    } else {
      Meteor.call(
        'set_highlight_type', highlight._id, 'note',
        function(error, result) {
          Session.set('is_editing_highlight_content', false);
        }
      )
    }
  }
}

do_typeahead_type_of_highlight = function(datum) {
  set_highlight_speaker(datum.value, datum.type, datum.id);
  set_start_time(true);
  show_content_input();
}

var count_text_chars = function(text) {
  if (typeof text == "undefined" || !text) {
    return 0;
  }
  return text.text().length;
};

var get_selections_companies = function() {
  var episode_id = Session.get('episode_id_for_search');
  return Companies.find({
    sponsored_episodes:episode_id
  }, {
    fields:{name:true},
  }).map(
    function(company) {
      return {value:capitalize(company.name), id:company._id, type:'sponsor', episode_id:episode_id}
    }
  );
}
var get_selections_people = function() {
  var episode_id = Session.get('episode_id_for_search');
  return People.find({
    $or:[{hosts:episode_id}, {guests:episode_id}]
  }, {
    fields:{first_name:true, last_name:true},
  }).map(
    function(person) {
      var name = capitalize(person.first_name) + ' ' + capitalize(person.last_name);
      return {value:name, id:person._id, type:'person', episode_id:episode_id}
    }
  );
}

var hide_content_input = function() {
  $('#speaker_name').hide();
  hide_input('content_input', 'content_input_span');
  $('#character_cutoff').hide();
}

var hide_input = function(input, span) {
  $('#' + input).text('');
  $('#' + span).hide();
}

var new_highlight = function() {
  //_speaker_name holds the name, e.g. "Matt Tanase" or "Link"
  return {type:null, editor_id:Meteor.userId(), episode_id:null,
          start_time:null, text:null, person_id:null,
          company_id:null, url:null, _speaker_name:null}
}

var set_css_new = function() {
  $('#content_input').css('font-style', 'normal');
  hide_content_input();
  editor_reactivity.set('highlight_cutoff', 0);
  set_start_time(false);
  $('#new_input_dot').show()
  $('#typeahead_input').show();
  var speaker = $('#speaker_input');
  speaker.typeahead('val', '');
  speaker.val('');
  speaker.focus();
}

var set_css_time = function(tmpl, plain_text) {
  var hide, show;
  if (plain_text) {
    show = '.plain_text_time';
    hide = '.edit_text_time';
  } else {
    hide = '.plain_text_time';
    show = '.edit_text_time';
  }

  if (tmpl) {
    tmpl.$(hide).hide();
    tmpl.$(show).show();
    if (!plain_text) {
      tmpl.$(show).focus();
    }
  } else {
    $(show).show();
    $(hide).hide();
  }
}

set_editor_search = function() {
  var datums_company = new Bloodhound({
  datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: get_selections_companies()
  });
  datums_company.initialize();

  var datums_people = new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: get_selections_people()
  });
  datums_people.initialize();

  $('#speaker_input').typeahead(
    {
      highlight:true
    },
    {
      displayKey: 'value',
      source: datums_people.ttAdapter(),
      limit: 5,
      templates: {
        header: '<div class="tt-header">People</div>'
      }
    },
    {
      displayKey: 'value',
      source: datums_company.ttAdapter(),
      limit: 5,
      templates: {
        header: '<div class="tt-header">Companies</div>'
      }
    }
  ).on('typeahead:selected', function(event, datum, name) {
    do_typeahead_type_of_highlight(datum);
  }).on('typeahead:autocompleted', function(event, datum, name) {
    do_typeahead_type_of_highlight(datum);
  });
}

var set_highlight_finished = function(text, episode_id, tmpl) {
  session_var_set_obj('highlight', ['text', 'episode_id'], [text, episode_id]);
  var highlight = Session.get('highlight');
  var type = highlight['type'];
  Meteor.call(
    'add_highlight', highlight,
    function(error, result) {
      if (type != 'link' && highlight['_speaker_name'] && !highlight['company_id'] && !highlight['person_id']) { //new company
        reset_typeaheads();
      }
      Session.set('highlight', new_highlight());
      set_css_new();
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
  } else if (style == 'normal') {
    session_var_set_obj('highlight', ['type'], ['note']);
  }
  $('#content_input').css('font-style', style);
}

var set_start_time = function(now) {
  if (!now) {
    session_var_set_obj('highlight', ['start_time'], [null]);
  } else if (Meteor.settings && Meteor.settings.public && Meteor.settings.public.dev_mode) {
    session_var_set_obj('highlight', ['start_time'],
                        [Math.floor(Math.random()*3000) + 1]);
  } else {
    session_var_set_obj('highlight', ['start_time'],
                        [Math.max(Session.get('player_time') - 5, 0)]);
  }
}

var show_content_input = function() {
  $('#typeahead_input').hide();
  $('#new_input_dot').hide();
  $('#speaker_name').show();
  $('#content_input_span').show();
  $('#content_input').focus();
  $('#character_cutoff').show();
}

var validate_time = function(new_time_string, old_time_secs) {
  var new_time_secs = format_clock_to_seconds(new_time_string);
  //include a check for it to be less than the duration of the video
  if (new_time_secs && new_time_secs != old_time_secs && new_time_secs < get_player_duration()) {
    return new_time_secs;
  } else {
    return false;
  }
}

Deps.autorun(function() {
  if (Session.get('editor_new_input_rendered') && Session.get('episode_id_for_search')) {
    reset_typeaheads(Session.get('episode_id_for_search'));
    $('#speaker_input').focus();
  }
})
