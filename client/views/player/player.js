var player = null;
var default_marker_setting = {
  markerStyle: {
    'width':'1px',
    'background-color': 'red'
  }
}

Template.player.rendered = function() {
  if (this.data) {
    load_video(this.data.seconds, this.data.highlights);
  }

  Meteor.Keybindings.add({
    'esc': function() {
      player_toggle();
    },
    'shift+,': function () {
      player_skip("back");
     },
    'shift+.': function () {
      player_skip("forward");
    }
  });
};

Template.player.destroyed = function() {
  Meteor.Keybindings.removeAll();
  dispose_video();
};

var _add_cuepoint = function(namespace, start, end, onStart, onEnd, params) {
  player.addCuepoint({
    namespace: namespace,
    start: start,
    end: end,
    onStart: onStart,
    onEnd: onEnd,
    params: params
  });
}

var add_highlight_cuepoint = function(highlight) {
  _add_cuepoint(
    "highlight", highlight.start_time, highlight.start_time + 15,
    function(params) {
      Session.set('current_chapter_cue', params.chapter_id);
      Session.set('current_highlight_cue', params.id)
    },
    function(params) {
      Session.set('current_highlight_cue', null);
    },
    {chapter_id:highlight.chapter_id, id:highlight._id}
  )
}

var dispose_video = function() {
  videojs("#player").dispose();
  Session.set('player_loaded', false);
  Session.set('player_time', null);
};

var load_video = function(seconds, highlights) {
  videojs(
    "#player",
    {
      "controls":true, "preload":"auto", "autoplay":false, "techOrder": ["youtube", "html5", "flash"]
    },
    function() {
      $('.vjs-big-play-button').css("margin-top", "-1.33em"); //to fix the play button, may not actually be consistent
      $('.vjs-fullscreen-control').css("visibility", "hidden");
      if (seconds) {
        this.currentTime(seconds);
      }
    }
  ).ready(function() {
    player = this;
    player.play();
    player.pause();

    set_timeupdate(function() {
      Session.set('player_time', Math.floor(player.currentTime()));
    });

    if (highlights) {
      player.cuepoints();
      highlights.forEach(function(highlight) {
        add_highlight_cuepoint(highlight);
      });
      set_markers(highlights);
    }

    Session.set('player_loaded', true);
  });
};

var player_skip = function(direction, amount) {
  amount = amount || 5;
  time = videojs("#player").currentTime();
  if ( direction == 'back' )
  {
    videojs("#player").currentTime(time - amount);
  } else {
    videojs("#player").currentTime(time + amount);
  }
  return;
};

var player_toggle = function () {
  if ( videojs("#player").paused() ) {
    videojs("#player").play();
  } else {
    videojs("#player").pause();
  }
  return;
}

var set_markers = function(highlights, setting) {
  setting = setting || default_marker_setting;
  player.markers({
    setting: setting,
    marker_breaks: highlights.map(function(highlight) {return highlight.start_time}),
    marker_text: highlights.map(function(highlight) {return text_limit(highlight.text, 20)})
  });
}

get_player_duration = function() {
  return player.duration();
}

set_timeupdate = function(doFunc) {
  player.on('timeupdate', doFunc)
}
