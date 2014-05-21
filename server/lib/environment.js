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



Accounts.emailTemplates.siteName = "Timelined";
Accounts.emailTemplates.from = "Timelined Support <support@timelined.com>";

Accounts.emailTemplates.enrollAccount.subject = function (user) {
    return "Timelined is going to rock your world, " + user.usernmame;
};
Accounts.emailTemplates.enrollAccount.text = function (user, url) {
   return "Are you ready for Timelined? Click the link below to get started:\n\n"
     + url;
};

Accounts.emailTemplates.verifyEmail.subject = function (user) {
    return "Timelined is confirming your email address, " + user.username;
};
Accounts.emailTemplates.verifyEmail.text = function (user, url) {
   return "Do us a favor? Click the link below to confirm your new address:\n\n"
     + url;
};

Accounts.emailTemplates.resetPassword.subject = function (user) {
    return "Timelined has reset your password, " + user.username;
};
Accounts.emailTemplates.resetPassword.text = function (user, url) {
   return "Don't worry, it happens to the best of us. Click the link below to reset your password:\n\n"
     + url;
};
