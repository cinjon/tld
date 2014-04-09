var max_chars = 140;

Template.character_cutoff.helpers({
  current_char_counter: function() {
    return parseInt(Session.get('current_char_counter'));
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
  'keyup .edit_text_time': function(e, tmpl) {
    if (e.keyCode == 13) {
      var val = validate_time($(e.target).val(), this.start_time);
      if (val) {
        Meteor.call('set_start_time', this._id, val)
      }
      set_css_time(tmpl, true);
    }
  },
});

Template.editor_highlight_time.helpers({
  edit_time: function() {
    if (!this.new_time) {
      return "edit_time";
    }
    return "";
  },
});

Template.editor_mode_draft.helpers({
  episode_id: function() {
    return this._id;
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

Template.editor_new_input.events({
  'keydown #content_input': function(e, tmpl) {
    var val = $(e.target).val();
    if (e.keyCode == 8 && val == '') {
      set_highlight_type('normal');
      set_highlight_speaker(null);
      set_css_new();
      return;
    } else if (e.keyCode == 8 && val == '"') {
      set_highlight_type('note');
      $(e.target).val('');
    }
  },
  'keyup #content_input': function(e, tmpl) {
    var input = $(e.target);
    var val = input.val().trim();
    var length = val.length;

    if (length > max_chars*1.5) { //Check for it being way too long
      input.val(val.slice(0,max_chars*1.5))
    } else if (e.shiftKey && val == '"' && e.keyCode == 222) { //Quote in beginning
      var type = Session.get('highlight')['type'];
      if (type && type == 'link') {
        $(e.target).val('');
      } else {
        set_highlight_type('italic');
      }
    } else if (e.keyCode == 13 && val != '' && Session.get('current_char_counter') <= max_chars) { //Complete highlight
      //TODO: stop flickering newline
      set_highlight_finished(val, this.episode_id, tmpl);
    } else {
      Session.set('current_char_counter', length);
      var test = tmpl.$('#content_input_text_test');
      test.text(val);
      var width = test.width();
      var rows = parseInt(input.attr('rows'));
      if (width >= input.width()*rows) {
        input.attr('rows', (rows + 1).toString());
      } else if (width < input.width()*(rows-1)) {
        input.attr('rows', (rows - 1).toString());
      }
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

Template.editor_search.events({
  'keydown .editor_search_input': function(e, tmpl) {
    var val = $(e.target).val();
    if (e.keyCode == 8 && val == '') {
      set_highlight_type('normal');
      set_highlight_speaker(null);
      set_css_new(tmpl);
      return;
    }
  },
  'keyup #prefix_token_input': function(e, tmpl) {
    var value = $(e.target).val();
    $(e.target).val('');
    if (value == '#') {
      session_var_set_obj(
        'highlight', ['type', '_speaker_name'], ['link', 'Link']
      )
      show_content_input();
      set_start_time(true);
    } else if (value == '!') {
      show_prefix_selection(tmpl, 'sponsor');
      set_start_time(true);
    } else if (value == '@') {
      show_prefix_selection(tmpl, 'speaker');
      set_start_time(true);
    }
  },
  'keyup #sponsor_input': function(e, tmpl) {
    var val = $(e.target).val().trim();
    if (e.keyCode == 13 && val != '') { //enter
      var type = Session.get('highlight')['type'];
      if (!type) { //new company
        set_highlight_speaker(val, 'sponsor', null);
        show_prefix(tmpl, 'sponsor');
        show_content_input();
      }
    }
  },
});

var do_typeahead_type_of_highlight = function(datum) {
  set_highlight_speaker(datum.value, datum.type, datum.id);
  show_content_input();
}

var count_text_chars = function(text) {
  if (typeof text == "undefined" || !text) {
    return 0;
  }
  return text.text().length;
};

var get_selections_company = function() {
  return Companies.find({}, {fields:{name:true}, reactive:false}).map(function(company) {
    var name = company.name;
    return {value:name, id:company._id, type:'sponsor'}
  });
}

var hide_content_input = function() {
  $('#speaker_name').hide();
  hide_input('content_input', 'content_input_span');
}

var hide_input = function(input, span) {
  $('#' + input).val('');
  $('#' + span).hide();
}

var new_highlight = function() {
  //_speaker_name holds the name, e.g. "Matt Tanase" or "Link"
  return {type:null, editor_id:Meteor.userId(), episode_id:null,
          start_time:null, text:null, person_id:null,
          company_id:null, url:null, _speaker_name:null}
}

var set_css_new = function() {
  hide_content_input();
  Session.set('current_char_counter', 0);
  set_start_time(false);

  hide_input('speaker_input', 'speaker_span');
  hide_input('sponsor_input', 'sponsor_span');

  $('#typeahead_input').show();
  var prefix_token_input = $('#prefix_token_input');
  prefix_token_input.val('');
  prefix_token_input.show();
  prefix_token_input.focus();
}

var set_css_time = function(tmpl, plain_text) {
  var hide, show, margin;
  if (plain_text) {
    margin = '10px'
    show = '.plain_text_time';
    hide = '.edit_text_time';
  } else {
    margin = '5px';
    hide = '.plain_text_time';
    show = '.edit_text_time';
  }

  if (tmpl) {
    tmpl.$(hide).hide();
    tmpl.$(show).show();
    tmpl.$('.row_text_time').css('margin-right', margin);
  } else {
    $(show).show();
    $(hide).hide();
    $('.row_text_time').css('margin-right', '10px');
  }
}

var set_highlight_finished = function(text, episode_id, tmpl) {
  session_var_set_obj('highlight', ['text', 'episode_id'], [text, episode_id]);
  var highlight = Session.get('highlight');
  Meteor.call(
    'add_highlight', highlight,
    function(error, result) {
      if (highlight['_speaker_name'] && !highlight['company_id'] && !highlight['person_id']) { //new company
        $('#sponsor_input').typeahead('destroy','NoCached');
        set_sponsor_typeahead();
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

set_sponsor_typeahead = function() {
  var data_companies = get_selections_company();
  var datums_company = new Bloodhound({
  datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: data_companies
  });
  datums_company.initialize();

  $('#sponsor_input').typeahead(
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
    }
  ).on('typeahead:selected', function(event, datum, name) {
    do_typeahead_type_of_highlight(datum);
  });
}

var set_start_time = function(now) {
  if (!now) {
    session_var_set_obj('highlight', ['start_time'], [null]);
  } else {
    session_var_set_obj('highlight', ['start_time'],
                        [Math.floor(Math.random()*300) + 1]);
                        // [Math.max(Session.get('player_time') - 5, 0)]);
  }
}

var show_content_input = function() {
  $('#typeahead_input').hide();
  $('#speaker_name').css('display', 'table-cell');
  $('#speaker_type').show();
  $('#content_input_span').css('display', 'table-cell');
  $('#content_input').focus();
}

var show_prefix = function(tmpl, type) {
  tmpl.$('#' + type + '_input').val('');
  tmpl.$('#' + type + '_span').hide();
  tmpl.$('#prefix_token_input').show();
}

var show_prefix_selection = function(tmpl, type) {
  tmpl.$('#prefix_token_input').hide();
  tmpl.$('#' + type + '_span').show();
  tmpl.$('#' + type + '_input').focus();
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