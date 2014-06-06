Meteor.startup(function() {
  AccountsEntry.config({
    signupCode: null,
    wrapLinks: true,
    homeRoute: '/',
    dashboardRoute: '/',
    signInTemplate: 'tlEntrySignIn',
    signUpTemplate: 'tlEntrySignUp'
  });

  Accounts.config({
    sendVerificationEmail: true
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
      user.profile = options.profile;
      user.profile.profile_image_url = user.services.twitter.profile_image_url;
      user.profile.profile_image_url_https = user.services.twitter.profile_image_url_https;
      user.username = user.services.twitter.screenName;
    } else { //Twitter signups won't have an email.
      Meteor.call('send_email', {
        to: user.emails[0].address,
        from: 'Timelined Support <support@timelined.com>',
        subject: 'Timelined welcomes you, ' + capitalize(user.username),
        
        text: "We're excited to have you joining the Timelined Community. \
        Should you have any questions or feedback, send us a note, we'd love to hear from you. \
        \n\nSincerely, \nThe Timelined Team\nsupport@timelined.com \
        \n\n PS - Is there something you'd like to see timelined? Let us know!",

        html: ''
      });
    };

    return user;
  });

});

var is_twitter_create_user = function(user) {
  return user && user.services && user.services.twitter;
}


Accounts.emailTemplates.siteName = "Timelined";
Accounts.emailTemplates.from = "Timelined Support <support@timelined.com>";

// Accounts.emailTemplates.enrollAccount.subject = function (user) {
//     return "Timelined is going to rock your world, " + user.usernmame;
// };
// Accounts.emailTemplates.enrollAccount.text = function (user, url) {
//    return "Are you ready for Timelined? Click the link below to get started:\n\n"
//      + url;
// };

Accounts.emailTemplates.verifyEmail.subject = function (user) {
    return "Timelined is confirming your email address, " + capitalize(user.username);
};
Accounts.emailTemplates.verifyEmail.text = function (user, url) {
   return "Do us a favor? Click the link below to confirm your address:\n\n" +
     url +
     "\n\nSincerely,\nThe Timelined Team\nsupport@timelined.com";
};

Accounts.emailTemplates.resetPassword.subject = function (user) {
    return "Timelined has reset your password, " + capitalize(user.username);
};
Accounts.emailTemplates.resetPassword.text = function (user, url) {
   return "Don't worry, it happens to the best of us. Click the link below to reset your password:\n\n" +
    url +
    "\n\nSincerely,\nThe Timelined Team\nsupport@timelined.com";
};




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
