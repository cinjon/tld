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

// Episodes.after.update( function (userId, doc, fieldNames, modifier) {
//   //TODO: send email after episode is pulished
//   sub: Timelined has published episode TITLE
//
//   USERNAME,
//
//    Nice work on this episode, you can see it published here: LINK_TO_EPISODE.
//
//   LENGTH_OF_CONTENT hours has been added to your work total, feel free to start timelining a new episode.
//
//   SIGNOFF
//
//   PS - Payment is issued after 20 hours of submitted content and you will receive a notification email.
//
// });

Meteor.users.after.insert( function (userId, doc) {
  Meteor.call('make_trial_episodes', doc._id);
});
