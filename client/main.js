// subscriptions and basic Meteor.startup code
Meteor.startup(function() {
  window.trackJs.configure({
    consoleDisplay: false,
    trackAjaxFail: false
  });

  window.trackJs.watchAll(Meteor.Collection);
});
