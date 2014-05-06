Meteor.startup(function() {
  AccountsEntry.config({
    signupCode: null,
    wrapLinks: true,
    homeRoute: '/',
    dashboardRoute: '/',
    signInTemplate: 'tlEntrySignIn',
    signUpTemplate: 'tlEntrySignUp'

  });

  Accounts.loginServiceConfiguration.remove({
    service: 'twitter'
  });

  Accounts.loginServiceConfiguration.insert({
    service: 'twitter',
    consumerKey: '5652mv0T0hgtDhVy16TxRLKLC',
    secret: 'WBuy28o6fv3FJfdVwSWN0KBAztdCemFTFoDgm9ghltZ0NmcT2s',
  });

  Accounts.onCreateUser(function(options, user) {
    /*
    For Twitter,
      options: { profile: { name: 'name'}},
      user: { createdAt: Wed May 07 2014 14:05:48 GMT+0200 (CEST), _id: 'gtp6SXtDjdbL5Mjuh',
              services: { twitter: { id: '2481973470', screenName: 'tld_ctr_2', accessToken: '', accessTokenSecret: '', profile_image_url: 'http://url.png', profile_image_url_https: 'https://url.png', lang: 'en'}}}
    */

    if (is_twitter_create_user(user)) {
      user.profile = options.profile
      user.profile.profile_image_url = user.services.twitter.profile_image_url
      user.profile.profile_image_url_https = user.services.twitter.profile_image_url_https
      user.username = user.services.twitter.screenName;
    }
    return user;
  });
  // AccountsEntry.config({
  //   privacyUrl: '/privacy-policy',
  //   termsUrl: '/terms-of-use',
  //   passwordSignupFields: 'USERNAME_AND_EMAIL',
  //   homeRoute: '/',
  //   dashboardRoute: '/',
  //   profileRoute: '/',
  //   showSignupCode: false,
  //   templates: {
  //     entrySignIn: 'tlEntrySignIn',
  //     entrySignUp: 'tlEntrySignUp'
  //   }
  // });

});

var is_twitter_create_user = function(user) {
  return user && user.services && user.services.twitter;
}