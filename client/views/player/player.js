Template.player.rendered = function() {
  load_video();
};

Template.player.destroyed = function() {
  dispose_video();
};

var dispose_video = function() {
  videojs("#player").dispose();
};

var load_video = function(seconds) {
  videojs(
    "#player", {"controls":true, "preload":"auto", "autoplay":false},
    function() {
      $('.vjs-big-play-button').css("margin-top", "-1.33em"); //to fix the play button, may not actually be consistent
      $('.vjs-fullscreen-control').css("visibility", "hidden");
      if (seconds) {
        this.currentTime(seconds);
      }
    }
  );
};