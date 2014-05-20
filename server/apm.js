Meteor.startup(function() {

  if (Meteor.settings.public && Meteor.settings.public.prod_mode == true) {
    Apm.connect('Z7DnhNscqNrEPEgD4', 'd8620f1c-8ee4-4e98-98ed-0b1c582f1778');
  };

  if (Meteor.settings.public && Meteor.settings.public.stage_mode == true) {
    Apm.connect('GgSM4aiAnM3GBYk2z', '11bf6768-5fb2-4623-b80d-23efb0c3033a');
  };

});
