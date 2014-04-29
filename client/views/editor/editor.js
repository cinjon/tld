MAX_CHARACTERS_IN_CONTENT = 140;
editor_title_placeholder = "Title Me Please"

Template.add_entity.events({
  'click button': function(e, tmpl) {
    toggle_add_entity(false, this.id)
  },
  'keydown .new_entity_input': function(e, tmpl) {
    var val = $(e.target).val();
    if (e.keyCode == 8 && val == '') {
      e.preventDefault();
      toggle_add_entity(true, this.id);
    }
  },
  'keyup .new_entity_input': function(e, tmpl) {
    var name = $(e.target).val().trim();
    var type = this.id;
    if (e.keyCode == 13 && name != '') {
      if ((this.id == 'host' || this.id == 'guest') && name.split(' ').length < 2) {
        $('#add_person_modal').modal(
          {keyboard:true, show:true}
        );
      } else {
        var episode_id = this.episode_id;
        Meteor.call(
          'new_' + type, name, episode_id, function(err, result) {
            reset_typeaheads(episode_id);
            toggle_add_entity(true, type);
          }
        );
      }
    }
  },
});

Template.character_cutoff.helpers({
  current_char_counter: function() {
    return parseInt(Session.get('current_char_counter'));
  },
  current_char_class: function() {
    if (Session.get('current_char_counter') > MAX_CHARACTERS_IN_CONTENT) {
      return 'exceeded';
    }
    return '';
  },
  max_chars: function() {
    return MAX_CHARACTERS_IN_CONTENT;
  }
});

Template.editor.created = function() {
  Session.set('editor_mode', 'draft');
  Session.set('current_char_counter', 0);
}

Template.editor.events({
  'click .remove_entity': function(e, tmpl) {
    var type = $(e.target).closest('a').attr('type');
    var episode_id = this.episode_id
    var entity_id = this._id;
    Meteor.call(
      'remove_' + type, episode_id, entity_id,
      function(error, result) {
        if (result['success']) {
          reset_typeaheads(episode_id);
        } else {
          $('#remove_entity_modal').modal(
            {keyboard:true, show:true}
          );
        }
      }
    );
  },
  'keydown .episode_title': function(e, tmpl) {
    var target = tmpl.$(e.target);
    var val = target.text().trim();
    var title = this.episode.title || editor_title_placeholder;
    if (e.keyCode == 13) {
      e.preventDefault();
    }

    if (e.keyCode == 13 && val != '' && val != editor_title_placeholder) {
      Meteor.call(
        'set_episode_title', this.episode._id, val,
        function(error, result) {
          target.blur();
        }
      );
    } else if (e.keyCode == 27) {
      target.blur();
      target.text(title);
    }
  }
});

Template.editor.helpers({
  add_guest: function() {
    return add_entity_helper(this.episode, 'guest');
  },
  add_host: function() {
    return add_entity_helper(this.episode, 'host');
  },
  add_sponsor: function() {
    return add_entity_helper(this.episode, 'sponsor');
  },
  episode_title: function() {
    var title = editor_title_placeholder;
    var episode = this.episode;
    if (episode && episode.title) {
      title = episode.title;
    }
    return title;
  },
  feed_summary: function() {
    var episode = this.episode;
    if (episode && episode.feed && episode.feed.summary) {
      return episode.feed.summary;
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
      key:'review',
      title:'Review'
    }
  },
  header_draft: function() {
    return {
      key:'draft',
      title:'Draft'
    }
  },
  header_publish: function() {
    return {
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
  player_data: function() {
    return {
      storage_key: this.episode.storage_key,
      format: this.episode.format,
      type: this.episode.type,
      url: this.episode.feed.url,
      seconds: 0,
      height: "300px"
    }
  },
  sponsors: function() {
    var episode = this.episode;
    if (!episode) {
      return [];
    }
    var id = episode._id;
    return Companies.find({sponsored_episodes:id}).map(function(company) {
      company.episode_id = id;
      return company;
    });
  }
});

Template.editor.rendered = function(){
  var me = this;
  $('body').tooltip({
      selector: '[data-toggle="tooltip"]'
  });
}

Template.editor_header_box.events({
  'click button': function(e, tmpl) {
    var editor_mode = Session.get('editor_mode');
    Session.set('editor_mode', this.key);
    if (this.key != editor_mode) {
      reset_editor_session_vars();
    }
  }
});

Template.editor_header_box.helpers({
  num_reviews: function() {
    if (this.key == 'review') {
      var count = get_untitled_chapter_count() + get_incomplete_links_count();
      if (count > 0) {
        return '(' + count.toString() + ')';
      } else {
        return '';
      }
    }
  }
});

Template.editor_highlight.events({
  'click .highlight_content': function(e, tmpl) {
    Session.set('is_editing_highlight_content', this._id);
    Session.set('is_editing_highlight_url', false);
    //TODO: focus the element after this happens ... can't do it immediately after
  },
  'click .highlight_url': function(e, tmpl) {
    Session.set('is_editing_highlight_url', this._id);
    Session.set('is_editing_highlight_content', false);
    //TODO: focus the element after this happens ... can't do it immediately after
  },
  'click .remove_highlight': function(e, tmpl) {
    Meteor.call('remove_highlight', this._id);
  },
  'keydown #content_input': function(e, tmpl) {
    if (e.keyCode == 8 && tmpl.$(e.target).val() == '"') {
      Meteor.call('set_highlight_type', this._id, 'note');
    }
  },
  'keyup #content_input': function(e, tmpl) {
    do_content_input(e, false, null, this);
  },
  'keyup #url_input': function(e, tmpl) {
    var input = $(e.target);
    var val = input.val().trim();
    if (e.keyCode == 13) {
      e.preventDefault();
      Meteor.call('set_highlight_url', this._id, val);
      Session.set('is_editing_highlight_url', false);
    } else if (e.keyCode == 27) {
      e.preventDefault();
      Session.set('is_editing_highlight_url', false);
    }
  }
});

Template.editor_highlight.helpers({
  company: function() {
    var company = Companies.findOne({_id:this.company_id});
    company.type = 'company';
    return company;
  },
  font_style: function() {
    if (this.type == "quote") {
      return "font-style:italic;"
    }
  },
  is_editing_highlight_content: function() {
    return Session.get('is_editing_highlight_content') == this._id;
  },
  is_editing_highlight_url: function() {
    return is_editor_mode('review') && Session.get('is_editing_highlight_url') == this._id;
  },
  has_person: function() {
    return this.person_id != null;
  },
  has_company: function() {
    return this.company_id != null;
  },
  has_link: function() {
    return this.type == 'link';
  },
  has_link_review: function() {
    return this.type == 'link' && is_editor_mode('review');
  },
  link: function() {
    return {type:'link'}
  },
  person: function() {
    var person = People.findOne({_id:this.person_id});
    person.type = 'person';
    return person;
  },
  type_title: function() {
    if (this.person_id) {
      var person = People.findOne({_id:this.person_id});
      if (person) {
        return capitalize(person.first_name);
      }
    } else if (this.company_id) {
      var company = Companies.findOne({_id:this.company_id});
      if (company) {
        return capitalize(company.name)
      }
    } else if (this.type == "link") {
      return "Link";
    }
    return '';
  },
  url_placeholder: function() {
    if (!this.url || this.url == '') {
      return "Enter Url";
    }
    return this.url;
  }
});

Template.editor_highlight.rendered = function() {
  fit_content_text_to_row(this); //TODO: fix this
}

Template.small_person_display.helpers({
  has_avatar: function() {
    return this.avatar && this.avatar != '';
  },
  has_twitter: function() {
    return this.twitter && this.twitter != '';
  },
  name: function() {
    if (this.name) {
      return capitalize(this.name);
    } else {
      return capitalize(this.first_name) + ' ' + capitalize(this.last_name);
    }
  },
});

Template.small_picture.helpers({
  is_type: function(type) {
    return this.type == type;
  }
});

var add_entity_helper = function(episode, type) {
  if (episode) {
    return {
      id:type,
      episode_id:episode._id
    }
  }
}

var destroy_typeaheads = function() {
  $('#speaker_input').typeahead('destroy','NoCached')
  $('#new_entity_input_guest').typeahead('destroy','NoCached');
  $('#new_entity_input_host').typeahead('destroy','NoCached');
  $('#new_entity_input_sponsor').typeahead('destroy','NoCached');
};

var fit_content_text_to_row = function(tmpl) {
  //Reduces the size of the text to fit the row
  //TODO: currently does not work and causes an infinite loop that crashes the tab

  /*
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
  */
}

var get_all_companies = function(episode_id) {
  return Companies.find({}, {fields:{name:true, _id:true}}).fetch().map(function(company) {
    return {value:company.name, id:company._id, type:'sponsor', episode_id:episode_id}
  });
}

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
  var data = []
  People.find(
    {}, {fields:{first_name:true, last_name:true}}
  ).forEach(function(person) {
    if (hosts.indexOf(person._id) == -1 && guests.indexOf(person._id) == -1) {
      var name = capitalize(person.first_name) + ' ' + capitalize(person.last_name);
      data.push({value:name, id:person._id, type:'person', episode_id:episode_id});
    }
  });
  return data;
}

get_incomplete_links_count = function() {
  //TODO: cache
  var episode_id = Session.get('episode_id_for_search');
  if (!episode_id) {
    return 0;
  }
  var count = 0;
  Highlights.find({episode_id:episode_id, type:"link"}).fetch().forEach(function(highlight) {
    var url = highlight.url;
    var text = highlight.text;
    if (!url || url == '' || !text || text == '') {
      count += 1;
    }
  });
  return count;
}

get_untitled_chapter_count = function() {
  //TODO: cache
  var episode_id = Session.get('episode_id_for_search');
  if (!episode_id) {
    return 0;
  }
  return Chapters.find({episode_id:episode_id, title:null}).count();
}

var reset_editor_session_vars = function() {
  Session.set('is_editing_highlight_content', null);
  Session.set('is_editing_highlight_url', null);
}

reset_typeaheads = function(episode_id) {
  destroy_typeaheads();
  set_editor_search();
  if (episode_id) {
    set_entity_typeaheads(episode_id);
  }
}

var _set_entity_typeahead = function(type, datums) {
  datums.initialize();
  $('#new_entity_input_' + type).typeahead(
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
    Meteor.call(
      'add_' + type, datum.episode_id, datum.id,
      function(error, result) {
        reset_typeaheads(datum.episode_id);
        toggle_add_entity(true, type);
      }
    );
  })
}

var set_entity_typeaheads = function(episode_id) {
  var data = get_all_people(episode_id);
  if (data.length == 0) {
    return;
  }

  _set_entity_typeahead('guest', new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: data
  }))
  _set_entity_typeahead('host', new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: data
  }))
  _set_entity_typeahead('sponsor', new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: get_all_companies(episode_id)
  }))
}

var toggle_add_entity = function(button, entity_type) {
  var add_id = '#add_' + entity_type + '_button';
  var span_id = '#new_entity_input_span_' + entity_type;
  var input_id = '#new_entity_input_' + entity_type;

  if (button) {
    $(add_id).show();
    $(span_id).hide();
    $(input_id).val('');
  } else {
    $(add_id).hide();
    $(span_id).show();
    $(input_id).focus();
  }
}
