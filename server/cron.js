var CRON_RUNNING = false;

var min_ms = 60000;
var hour_ms = min_ms * 60;
var cron_minute_interval = new Cron(min_ms);
var cron_hour_interval = new Cron(hour_ms);
var hours_to_complete_episode = 36;
var hour_send_claim_warning_email = hours_to_complete_episode - 6;

if (CRON_RUNNING) {
  // unclaim expired jobs
  add_job(cron_hour_interval, 1, function() {
    var now = (new Date()).getTime();
    Episodes.update({
      claimed_at:{$exists:true,
                  $lte:hours_ago(hours_to_complete_episode, now),
                  $gt:hours_ago(hours_to_complete_episode + 1, now)},
      editor_id:{$ne:null},
      trial:false
    }, {
      $set:{editor_id:null}
    }, {
      multi:true
    });
  });

  // send out email saying yo, you only have X hours left
  add_job(cron_hour_interval, 1, function() {
    var now = (new Date()).getTime();
    var episodes_by_editor_id = {};
    //TODO: refactor with aggregate instead
    Episodes.find({
      claimed_at:{$exists:true,
                  $lte:hours_ago(hour_send_claim_warning_email - 1, now),
                  $gt:hours_ago(hour_send_claim_warning_email, now)},
      editor_id:{$ne:null},
      trial:false
    }, {
      fields: {
        title:true, show_route:true, editor_id:true, claimed_at:true, length_in_seconds:true
      }
    }).forEach(function(episode) {
      var editor_id = episode.editor_id;
      if (!(editor_id in episodes_by_editor_id)) {
        episodes_by_editor_id[editor_id] = [];
      }
      episodes_by_editor_id[editor_id].push(episode)
    });

    send_email_episode_warnings(episode_by_editor_id);
  })
}

var add_job = function(cron, num_intervals, job) {
  cron.addJob(num_intervals, job);
};

var hours_ago = function(num_hours, now) {
  now = now || (new Date()).getTime();
  return now - num_hours * hours_ms;
};

var send_email_episode_warnings = function(episodes_dict) {
  //episodes_dict is a dict of user_id:[episode objects]
  for (var user_id in episodes_dict) {
    var user = Meteor.users.findOne({_id:user_id});
    var episodes = episodes_dict[user_id];

    var message = "";
    message += "<p>Greetings " + user.username + "</p>";
    message += "<p>Please be aware that these episodes will soon be returned to the queue. \
    We'd love for you to complete them, so htere's an 8-hour warning. If not completed by then, \
    your work will be lost. If you're unable to complete these episodes, please goto the \
    <a href='http://timelined.com/queue'>queue</a> and unclaim them.</p>";

    message += "<ul>";
    episodes.forEach(function(episode) {
      url = "http://www.timelined.com/editor/" + episode.show_route + "/" + episode._id;
      message += "<li><a href='" + url + "'>" + episode.title + "</a></li>";
    });
    message += "</ul>";

    message += "<p>Sincerely,<br>The Timelined Team<br>support@timelined.com</p>";

    var mail_fields = {'to':user.emails[0]['address'], 'from':'Timelined Support <support@timelined.com>',
                       'subject':'Timelined 8-hour episode warning',
                       'text':"", 'html':message}
    Meteor.call('send_email', mail_fields);
  }
}
