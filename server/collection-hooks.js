// before/after hooks via collection-hooks package, server side only
// https://github.com/matb33/meteor-collection-hooks


Episodes.after.insert( function (userId, doc) {
  var chapter_id = make_chapter('Introduction', true, this._id, null, 0, [], null);
  if (chapter_id) {
    Episodes.update({_id:this._id}, {$addToSet:{chapters:chapter_id}});
  } else {
    console.log("Chapter insertion failed for this episode.");
  }
});

Meteor.users.after.insert( function (userId, doc) {
  Meteor.call('make_trial_episodes', doc._id);
});
