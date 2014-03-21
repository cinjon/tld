Template.editor.helpers({
  episode_title: function() {
    return this.episode.title;
  },
  guests: function() {
    return People.find({_id:{$in:this.episode.guest}});
  },
  highlights: function() {
    return Highlights.find({episode_id:this.episode._id});
  },
  hosts: function() {
    return People.find({_id:{$in:this.episode.host}});
  },
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
      return People.findOne({_id:this.person_id}).first_name
    } else if (this.type == "link") {
      return "Link";
    } else {
      return "TODO";
    }
  }
});
