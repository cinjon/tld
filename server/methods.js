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
    if (Meteor.settings.public && Meteor.settings.public.prod_mode == true) {
      trial_storage_keys = [
        "c95e29aa57a75300187631e89b913564", "ec5a8fc2cd1e25801ef6aa3c5b77ee9a",
        "8fb865b62dc6dcaf3b0390f8ded8aa5a", "8ff9850b83eae81a9559d0a19ff30749"
      ];
    } else {
      // dev or staging mode, storage_key data from fixtures.js
      trial_storage_keys = [
        "c8b1b604524c39612ba0be3423ca4669", "bde5a8980a18df163c1f80618bdbd6d6"
      ];
    }

    trial_storage_keys.forEach(function(storage_key) {
      make_trial_episode(storage_key, user_id);
    });
  },
  send_made_trial_email: function(user_id) {
    var user = Meteor.users.findOne({_id: user_id});
    if (!user.emails[0].address) {
      console.log('Make Trial Episode aborting: user does not have an email address.');
      return;
    } else {
      Meteor.users.update({_id:user_id}, {$set:{received_trial_email:true}});
    }

    Meteor.call("send_email", {
      to: user.emails[0].address,
      from: 'Timelined Support <support@timelined.com>',
      subject: "Timelined has sent you a trial episode, " + user.username,
      text: '',
      html: "Greetings Timelined editor-in-waiting, <br> \
      <p>Thank you for your patience. Before you get started, here are a few things to keep in mind. \
      A trial episode serves a dual purpose. First, it's a chance to practice using our application and get a feel for the workflow. \
      Second, it's an interview. We'll review and critique the highlights you create for your trial episode. \
      Remember, we're looking for editors who can quickly timeline with simple and objective summaries, useful links, \
      interesting quotes and accurate timestamps. Be sure you've reviewed the <a href='http://timelined.com/guidelines'>Editor Guidelines</a> and watched our \
      <a href='https://vimeo.com/97655214'>Editor screencast</a>. \
      Both  were designed to help you hit the ground running.</p> \
      <p><b><a href='http://timelined.com/queue'>Timelined Trial Episodes</a></b></p> \
      <p>Choose one of the four available episodes. Remember, this is a trial and you will not be paid for timelining it. If you have minor errors,\
      we may send feedback or give you the opportunity to timeline a second trial episode. If we like your work, \
      we'll follow-up with instructions on timelining new episodes. Should you have any questions, please get in touch.</p>\
      <br><p>Sincerely,<br>The Timelined Team<br>support@timelined.com</p>"
    });
  },
  reset_password: function(user_id) {
    if (Meteor.isServer) {
      Accounts.sendResetPasswordEmail(user_id);
    };
  },
  send_email: function(fields) {
    this.unblock();

    var _to, _from, _subject, _text, _html, _reply_to;

    if ('name' in fields && 'email' in fields && 'message' in fields) {
      //Result of using Autoform in /static/contact
      check(fields, contactSchema);
      _to = 'Timelined Support <support@timelined.com>';
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

    _reply_to = fields['reply_to'] || 'Timelined Support <support@timelined.com>'

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
