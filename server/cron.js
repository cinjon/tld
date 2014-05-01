var CRON_RUNNING = false;

var min_ms = 60000;
var hour_ms = min_ms * 60;
var cron_minute_interval = new Cron(min_ms);
var cron_hour_interval = new Cron(hour_ms);

if (CRON_RUNNING) {
  // unclaim expired jobs
  add_job(cron_hour_interval, 1, function() {
    var now = (new Date()).getTime();
    Episodes.update({
      claimed_at:{$exists:true, $lte:hours_ago(24, now), $gt:hours_ago(25, now)},
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
      claimed_at:{$exists:true, $lte:hours_ago(17, now), $gt:hours_ago(18, now)},
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
}

var hours_ago = function(num_hours, now) {
  now = now || (new Date()).getTime();
  return now - num_hours * hours_ms;
}

var send_email_episode_warnings = function(episodes_dict) {
  //episodes_dict is a dict of user_id:[episode objects]
  for (var user_id in episodes_dict) {
    var user = Meteor.users.findOne({_id:user_id});
    var episodes = episodes_dict[user_id];

    var message = "";
    message += "<p>Sir " + user.username + "</p>";
    message += "<p>Please note that the following episodes will soon be returned to the queue. We'd love for you to complete them, so here's a six hour warning.</p>"

    message += "<ul>"
    episodes.forEach(function(episode) {
      //TODO: how do we get the pathFor for episode url here?"
      message += "<li><a href=#>" + episode.title + "</a></li>"
    });
    message += "</ul>"

    var mail_fields = {'to':user.emails[0]['address'], 'from':'admin@timelined.com',
                       'subject':'Dearest Editor - Six Hour Warning',
                       'text':"", 'html':message}
    Meteor.call('send_email', mail_fields);
  }
}