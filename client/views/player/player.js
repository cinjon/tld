var player = null;

Template.player.rendered = function() {
  if (this.data) {
    load_video();
  }
};

Template.player.destroyed = function() {
  dispose_video();
};

var dispose_video = function() {
  videojs("#player").dispose();
  Session.set('player_loaded', false);
  Session.set('player_time', null);
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
  ).ready(function() {
    player = this;
    player.play();
    player.pause();
    player.on('timeupdate', function() {
      Session.set('player_time', Math.floor(player.currentTime()));
    });
    Session.set('player_loaded', true);
  });
};

player_duration = function() {
  return player.duration();
}