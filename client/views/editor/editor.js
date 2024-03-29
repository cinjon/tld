editor_reactivity = new ReactiveDict;
editor_title_placeholder = "Title Me Please"
MAX_CHARACTERS = {'highlight_cutoff':140, 'summary_cutoff':280}

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
            toggle_add_entity(true, type);
          }
        );
      }
    }
  },
});

Template.add_entity.helpers({
  is_type: function(type) {
    return this.id == type;
  },
});

Template.add_entity_input_guest.helpers({
  add_entity: function(event, datum, name) {
    add_entity_to_episode('guest', datum.episode_id, datum.id);
  },
  new_entity_input_guest_data: function() {
    return get_all_people(Session.get('episode_id_for_search'));
  }
})

Template.add_entity_input_guest.rendered = function() {
  Meteor.typeahead($('#new_entity_input_guest'));
}

Template.add_entity_input_host.helpers({
  add_entity: function(event, datum, name) {
    add_entity_to_episode('host', datum.episode_id, datum.id);
  },
  new_entity_input_host_data: function() {
    return get_all_people(Session.get('episode_id_for_search'));
  }
})

Template.add_entity_input_host.rendered = function() {
  Meteor.typeahead($('#new_entity_input_host'));
}

Template.add_entity_input_sponsor.helpers({
  add_entity: function(event, datum, name) {
    add_entity_to_episode('sponsor', datum.episode_id, datum.id);
  },
  new_entity_input_sponsor_data: function() {
    return get_all_companies(Session.get('episode_id_for_search'));
  }
})

Template.add_entity_input_sponsor.rendered = function() {
  Meteor.typeahead($('#new_entity_input_sponsor'));
}

Template.character_cutoff.helpers({
  current_char_counter: function() {
    return parseInt(editor_reactivity.get(this.char_counter_id));
  },
  current_char_class: function() {
    if (editor_reactivity.get(this.char_counter_id) > MAX_CHARACTERS[this.char_counter_id]) {
      return 'exceeded';
    }
    return '';
  },
  max_chars: function() {
    return MAX_CHARACTERS[this.char_counter_id];
  }
});

Template.editor.created = function() {
  Session.set('editor_mode', 'draft');
  editor_reactivity.set('highlight_cutoff', 0);
  editor_reactivity.set('summary_cutoff', 0);
}

Template.editor.events({
  'click .remove_entity': function(e, tmpl) {
    var type = $(e.target).closest('a').attr('type');
    var episode_id = this.episode_id
    var entity_id = this._id;
    Meteor.call(
      'remove_' + type, episode_id, entity_id,
      function(error, result) {
        if (!result['success']) {
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
    if (episode && episode.trial) {
      title += ' - Trial';
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
      summary: this.episode.summary,
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
  box_info: function() {
    return {
      key: this.key,
      num_reviews: get_num_reviews(this.key),
      title: this.title
    }
  }
});

Template.editor_highlight.events({
  'click .highlight_content': function(e, tmpl) {
    Session.set('is_editing_highlight_content', this._id);
    Session.set('is_editing_highlight_url', false);
    set_player_current_time(this.start_time);
  },
  'click .highlight_url': function(e, tmpl) {
    Session.set('is_editing_highlight_url', this._id);
    Session.set('is_editing_highlight_content', false);
    set_player_current_time(this.start_time);
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
  highlight_cutoff: function() {
    return {
      char_counter_id: 'highlight_cutoff'
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

var add_entity_to_episode = function(entity_type, episode_id, entity_id) {
  Meteor.call(
    'add_' + entity_type, episode_id, entity_id,
    function(error, result) {
      toggle_add_entity(true, entity_type);
    }
  );
}

var get_all_companies = function(episode_id) {
  var episode = Episodes.findOne({_id:episode_id});
  return Companies.find({_id:{$nin:episode.sponsors}}, {
    fields:{name:true, _id:true}
  }).fetch().map(function(company) {
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
      //TODO: move to template with {{title_case name}}
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

get_num_reviews = function(key) {
  var num_reviews = null;
  if (key == 'review') {
    var count = get_untitled_chapter_count() + get_incomplete_links_count();
    if (count > 0) {
      num_reviews = '(' + count.toString() + ')';
    }
  }
  return num_reviews;
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

var toggle_add_entity = function(button, entity_type) {
  var add_id = '#add_' + entity_type + '_button';
  var span_id = '#new_entity_input_span_' + entity_type;
  var input_id = '#new_entity_input_' + entity_type;

  if (button) {
    $(add_id).show();
    $(span_id).hide();
  } else {
    $(add_id).hide();
    $(span_id).show();
    $(input_id).val('');
    $(input_id).focus();
  }
}
