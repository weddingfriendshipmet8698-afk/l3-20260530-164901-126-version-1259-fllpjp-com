(function () {
  function init(box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('[data-play-cover]');
    var stream = box.getAttribute('data-stream');
    var ready = false;
    var hls = null;

    function attach() {
      if (ready || !video || !stream) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function start() {
      attach();
      box.classList.add('is-active');
      video.setAttribute('controls', 'controls');
      var play = video.play();
      if (play && typeof play.catch === 'function') {
        play.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!ready) {
          start();
        }
      });
    }
    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.querySelectorAll('[data-player]'), init);
  });
}());
