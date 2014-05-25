// Contacts
// {
//   name: string
//   email: string
//   message: string
//   created_at: date
// }

// NOTE: this is not a collection and not stored in Mongo

contactSchema = new SimpleSchema({
  name: {
    type: String,
    max: 50
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    label: "E-mail address"
  },
  message: {
    type: String,
    label: "Message"
  }
});
