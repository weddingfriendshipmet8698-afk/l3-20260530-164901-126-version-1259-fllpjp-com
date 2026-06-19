(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initPlayer(container) {
    var video = container.querySelector('video');
    var cover = container.querySelector('.player-cover');
    var errorBox = container.querySelector('.player-error');
    var streamUrl = container.getAttribute('data-video');
    var hls = null;
    var loaded = false;

    function showError(message) {
      if (errorBox) {
        errorBox.textContent = message;
        errorBox.classList.add('is-visible');
      }
    }

    function loadStream() {
      if (loaded) {
        return true;
      }
      if (!video || !streamUrl) {
        showError('播放暂不可用');
        return false;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError('视频加载失败，请稍后再试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else {
        showError('播放暂不可用');
        return false;
      }
      loaded = true;
      return true;
    }

    function play() {
      if (!loadStream()) {
        return;
      }
      video.controls = true;
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
    }
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
  });
})();
