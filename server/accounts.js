Meteor.startup(function() {
  AccountsEntry.config({
    signupCode: null,
    wrapLinks: true,
    homeRoute: '/',
    dashboardRoute: '/'
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
