(function () {
  function initPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var hls = null;

    function attach() {
      if (!stream) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      }
    }

    function play() {
      attach();
      var playPromise = video.play();
      player.classList.add('is-started');
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          player.classList.remove('is-started');
        });
      }
    }

    function toggle() {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('click', toggle);
    video.addEventListener('play', function () {
      player.classList.add('is-started');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        player.classList.remove('is-started');
      }
    });
    video.addEventListener('ended', function () {
      player.classList.remove('is-started');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
  });
})();
