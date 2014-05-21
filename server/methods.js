/*
  Server-only methods
*/

Meteor.methods({
  checkPassword: function(options) {
    check(options, {M: String});
    var serialized = Accounts._getAccountData(this.connection.id, 'srpChallenge');
    return serialized && serialized.M === options.M;
  },
  send_email: function(fields) {
    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();

    var _to = fields.to;
    var _from = fields.from;
    var _subject = fields.subject || '';
    var _text = fields.text || '';
    var _html = fields.html || '';

    if ('name' in fields && 'email' in fields && 'message' in fields) {
      check(fields, Schema.contact);
      _to = 'support@timelined.com';
      _from = fields.email;
      _subject = "Timelined Contact - Message From " + fields.name,
      _text = "Name: " + fields.name + "\n\n--"
        + "Email: " + fields.email + "\n\n\n\n--"
        + fields.message;
      _html = null;
    } else {
      check([fields.to, fields.from, fields.subject, fields.text, fields.html], [String]);
    }

    Meteor.Mailgun.send({
      to: _to,
      from: _from,
      subject: _subject,
      text: _text,
      html: _html
    });
  },
  send_slack_notification: function(channel, payload) {
    this.unblock();

    var url = null;
    if (channel == 'robots') {
      url = 'https://timelined.slack.com/services/hooks/incoming-webhook?token=SPSkMhmEj2aPN6IvhjDpqbjw';
    } else if (channel == 'editors') {
      url = 'https://timelined.slack.com/services/hooks/incoming-webhook?token=PmSrJ7Ai8nSoOpK2SIXVMkpa';
    }

    if (url) {
      HTTP.call("POST", url, {'data':payload})
    }
  }
});