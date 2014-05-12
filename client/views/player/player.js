var player = null;
var default_marker_setting = {
  markerStyle: {
    'width':'8px',
    'background-color': 'orange'
  },
}

Template.player.rendered = function() {
  if (this.data) {
    load_video(this.data.seconds, this.data.highlights, this.data.chapters);
  }

  Meteor.Keybindings.add({
    'shift+↓/shift+↑': function() {
      player_toggle();
    },
    'shift+←': function () {
      player_skip("back");
     },
    'shift+→': function () {
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

var load_video = function(seconds, highlights, chapters) {
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
    }
    if (chapters) {
      set_markers(chapters);
    }

    Session.set('player_loaded', true);

    player.on("pause", function(e){
      var parent = $(e.target).closest(".video-wrap");
      parent.addClass("vjs-paused");
      parent.removeClass("vjs-playing");
    });

    player.on("play", function(e){
      var parent = $(e.target).closest(".video-wrap");
      parent.removeClass("vjs-paused");
      parent.addClass("vjs-playing");
    });
  });
};

var player_skip = function(direction, amount) {
  if (document.activeElement.tagName == 'INPUT') {
    return;
  }
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

var set_markers = function(chapters, setting) {
  setting = setting || default_marker_setting;
  player.markers({
    setting: setting,
    marker_breaks: chapters.map(function(chapter) {return chapter.start_time}),
    marker_text: chapters.map(function(chapter) {return text_limit(chapter.title, 20)})
  });
}

get_player_duration = function() {
  return player.duration();
}

set_timeupdate = function(doFunc) {
  player.on('timeupdate', doFunc)
}

set_player_current_time = function(seconds) {
  if (seconds) {
    player.currentTime(seconds);
  }
}