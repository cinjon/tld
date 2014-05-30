// Shows
// {
//   name: string,
//   homepage: url,
//   feed: url,      // for RSS imports
//   feed_active: boolean, // tells collector.rb if this is ok to crawl
//   description: string,
//   created_at: date,
//   updated_at: date,
//   artwork: url,  // still deciding
//   route: string,  // url slug
//   feed_checked_at: date,  // for use in aggregator
// }
Shows = new Meteor.Collection('shows', {
  schema: new SimpleSchema({
      name: {
        type: String,
        label: 'Name'
      },
      homepage: {
        type: String,
        label: 'Homepage Link'
      },
      feed: {
        type: String,
        label: 'RSS Feed Link',
        optional: true
      },
      feed_active: {
        type: Boolean,
        label: 'Feed Active',
        autoValue: function() {
          if (this.isSet) {
            return this.value;
          } else if (this.isInsert || this.isUpdate) {
            return true;
          }
        }
      },
      description: {
        type: String,
        label: 'Description'
      },
      created_at: {
        type: Date,
          autoValue: function() {
          if (this.isInsert) {
            return new Date();
          } else if (this.isUpsert) {
            return {$setOnInsert: new Date()};
          } else {
            this.unset();
          }
        },
        denyUpdate: true
      },
      updated_at: {
        type: Date,
        autoValue: function() {
          if (this.isUpdate) {
            return new Date();
          }
        },
        denyInsert: true,
        optional: true
      },
      artwork: {
        type: String,
        label: 'Artwork Link',
        optional: true
      },
      route: {
        type: String,
        label: 'Router path',
        autoValue: function() {
          var name_field = this.field('name');
          if (name_field.isSet) {
            var count = Episodes.find({name:name_field.value}).count();
            return make_name_route(name_field.value, count);
          }
        }
      },
      feed_checked_at: {
        type: Date,
        label: 'Feed last checked at',
        optional: true
      }
  })
});


Shows.allow({
  insert: function () {
    return Roles.userIsInRole(Meteor.userId(), ['admin']);
  },
  remove: function () {
    return Roles.userIsInRole(Meteor.userId(), ['admin']);
  },
  update: function () {
    return Roles.userIsInRole(Meteor.userId(), ['admin']);
  }
});
