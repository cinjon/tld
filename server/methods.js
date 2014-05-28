/*
  Server-only methods
*/

Meteor.methods({
  check_password: function(options) {
    check(options, {M: String});
    var serialized = Accounts._getAccountData(this.connection.id, 'srpChallenge');
    return serialized && serialized.M === options.M;
  },
  make_trial_episodes: function(user_id) {
    this.unblock();

    //TODO: (matt) --> Insert storage keys for the episodes we want to use.
    trial_storage_keys = [
      "aa0cce0e8fc9903af13111fa10306d20", "b719ca8cf99dca1ab939faebe2d72cb2",
      "fba0c73b701d541d30390b1fc8ffc75b", "7e7062c1037e89f4f7fb862f74c15c29"
    ];
    trial_storage_keys.forEach(function(storage_key) {
      make_trial_episode(storage_key, user_id);
    });
  },
  reset_password: function(user_id) {
    if (Meteor.isServer) {
      Accounts.sendResetPasswordEmail(user_id);
    };
  },
  send_email: function(fields) {
    var _to, _from, _subject, _text, _html, _reply_to;

    if ('name' in fields && 'email' in fields && 'message' in fields) {
      //Result of using Autoform in /static/contact
      check(fields, contactSchema);
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
