Meteor.startup( function() {
  Accounts.ui.config({
    passwordSignupFields: 'EMAIL_ONLY'
  });
});

AccountsEntry.config({
  privacyUrl: '/privacy-policy',
  termsUrl: '/terms-of-service',
  passwordSignupFields: 'USERNAME_AND_EMAIL',
  homeRoute: '/',
  dashboardRoute: '/',
  profileRoute: '/profile',
  showSignupCode: false,
  signInTemplate: 'tlEntrySignIn',
  signUpTemplate: 'tlEntrySignUp'
});
