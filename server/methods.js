/*
  Server-only methods
*/

Meteor.methods({
  check_password: function(options) {
    check(options, {M: String});
    var serialized = Accounts._getAccountData(this.connection.id, 'srpChallenge');
    return serialized && serialized.M === options.M;
  },
  reset_password: function(user_id) {
    if (Meteor.isServer) {
      Accounts.sendResetPasswordEmail(user_id);
    };
  },
  send_email: function(fields) {
    // TODO: (In an actual application, you'd need to be careful to limit the emails that a client could send, to prevent your server from being used as a relay by spammers.)

    var _to, _from, _subject, _text, _html, _reply_to;

    if ('name' in fields && 'email' in fields && 'message' in fields) {
      //Result of using Autoform in /static/contact
      check(fields, Schema.contact);
      _to = 'support@timelined.com';
      _from = fields.email;
      _subject = "Timelined Contact - Message From " + fields.name,
      _text = "Name: " + fields.name + "\n\n--"
        + "Email: " + fields.email + "\n\n\n\n--"
        + fields.message;
      _html = '';
    } else {
      //Everything else
      _to = fields.to;
      _from = fields.from;
      _subject = fields.subject || '';
      _text = fields.text || '';
      _html = fields.html || '';
      check([fields.to, fields.from, fields.subject, fields.text, fields.html], [String]);
    }

    this.unblock();

    _reply_to = fields['reply_to'] || 'support@timelined.com'

    Email.send({
      to: _to,
      from: _from,
      subject: _subject,
      text: _text,
      html: _html,
      replyTo: _reply_to
     });
  },
  send_slack_notification: function(channel, payload) {
    if (!Meteor.settings.public || Meteor.settings.public.prod_mode != true) {
      // stop slack notification from appearing while in dev/staging mode
      return;
    }

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
