var player = null;
var default_marker_setting = {
  markerStyle: {
    'width':'4px',
    'background-color': '#df5445' // coral
  },
  markerTip: {
    default_text: "",
    show_colon: false
  }
};

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
    "highlight", highlight.start_time, highlight.start_time + 30,
    function(params) {
      Session.set('current_chapter_cue', params.chapter_id);
      Session.set('current_highlight_cue', params.id)
    },
    function(params) {
      if (Session.get('current_highlight_cue') == params.id) {
        Session.set('current_highlight_cue', null);
      }
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
    window.setTimeout(function() {
      player.trigger("timeupdate"); // get actual duration to show
    }, 500);

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

    // add forward/back
    videojs.SkipButton = videojs.Button.extend({
      init: function(player, options) {
        videojs.Button.call(this, player, options);
        this.on("click", this.onClick);
      }
    });

    videojs.SkipButton.prototype.onClick = function(e) {
      var direction = "back";
      if ($(e.target).hasClass("vjs-forward-control")) {
        direction = "forward";
      }
      player_skip(direction, 15);
    }

    var rewind = new videojs.SkipButton(player, {
      el: videojs.Component.prototype.createEl(null, {
        className: "vjs-control vjs-rewind-control",
        innerHTML: "<div class='vjs-control-content'><div class='vjs-control-text'>Rewind</div></div>",
        role: "button"
      })
    });
    player.controlBar.addChild(rewind);

    var forward = new videojs.SkipButton(player, {
      el: videojs.Component.prototype.createEl(null, {
        className: "vjs-control vjs-forward-control",
        innerHTML: "<div class='vjs-control-content'><div class='vjs-control-text'>Forward</div></div>",
        role: "button"
      })
    });
    player.controlBar.addChild(forward);

  });
};

var player_skip = function(direction, amount) {
  if (document.activeElement.tagName == 'INPUT') {
    return;
  }
  amount = amount || 5;
  var player = videojs("#player");
  var now = player.currentTime();
  if (direction === "back") {
    now -= amount;
  } else {
    now += amount;
  }
  if (now < 0) {
    now = 0;
  }
  if (now > player.duration()) {
    now = player.duration();
  }
  player.currentTime(now);
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
  var breaks = [];
  var texts = [];
  chapters.forEach(function(chapter) {
    breaks.push(chapter.start_time);
    texts.push(text_limit(chapter.title, 20));
  });
  player.markers({
    setting: setting,
    marker_breaks: breaks,
    marker_text: texts
  });
}

get_player_duration = function() {
  return player.duration();
}

is_less_than_duration = function(time) {
  return time < get_player_duration() || (Meteor.settings && Meteor.settings.public && Meteor.settings.public.dev_mode) //when no wifi...
}

set_timeupdate = function(doFunc) {
  player.on('timeupdate', doFunc)
}

set_player_current_time = function(seconds) {
  if (seconds) {
    player.currentTime(seconds);
  }
}

start_playing = function(seconds) {
  set_player_current_time(seconds);
  player.play();
}
