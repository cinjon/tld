// configuration of server side packages

// https://github.com/subhog/meteor-twit/
// http://meteorhacks.com/complete-npm-integration-for-meteor.html

TwitterConnection = Meteor.require('twit');

twitter = new TwitterConnection({
    consumer_key:         '5652mv0T0hgtDhVy16TxRLKLC',
    consumer_secret:      'WBuy28o6fv3FJfdVwSWN0KBAztdCemFTFoDgm9ghltZ0NmcT2s',
    access_token:         '2342982096-33YR91YymWVwXPuQkokypBqraAvkYiU6KXlj2ZI',
    access_token_secret:  'cXGBhY7D3dH8JU4jn0DqaNnWc2Uc4l7x1jJAZrsECpRG3'
});
