// A user document can contain any data you want to store about a user.
// Meteor treats the following fields specially:
//
// username: a unique String identifying the user.
//
// emails: an Array of Objects with keys address and verified; an email address may belong to at most one user.
// verified is a Boolean which is true if the user has verified the address with a token sent over email.
//
// createdAt: the Date at which the user document was created.
//
// profile: an Object which (by default) the user can create and update with any data.
//
// services: an Object containing data used by particular login services.
// For example, its reset field contains tokens used by forgot password links,
// and its resume field contains tokens used to keep you logged in between sessions.
