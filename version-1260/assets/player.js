function initMoviePlayer(id, src, poster) {
  var video = document.getElementById(id);
  if (!video) {
    return;
  }

  var box = video.closest('.player-box');
  var toggles = Array.prototype.slice.call(document.querySelectorAll('[data-player-toggle="' + id + '"]'));
  var muteButton = document.querySelector('[data-player-mute="' + id + '"]');
  var fullscreenButton = document.querySelector('[data-player-fullscreen="' + id + '"]');
  var hls = null;

  if (poster) {
    video.poster = poster;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src;
  } else if (window.Hls && window.Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(src);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal && box) {
        box.classList.add('has-error');
      }
    });
  } else if (box) {
    box.classList.add('has-error');
  }

  function refresh() {
    if (box) {
      box.classList.toggle('is-playing', !video.paused && !video.ended);
    }
    toggles.forEach(function (button) {
      button.textContent = video.paused ? '▶' : '❚❚';
    });
    if (muteButton) {
      muteButton.textContent = video.muted ? '静' : '声';
    }
  }

  function togglePlay() {
    if (video.paused || video.ended) {
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === 'function') {
        playRequest.catch(function () {});
      }
    } else {
      video.pause();
    }
    refresh();
  }

  toggles.forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      togglePlay();
    });
  });

  video.addEventListener('click', togglePlay);
  video.addEventListener('play', refresh);
  video.addEventListener('pause', refresh);
  video.addEventListener('ended', refresh);

  if (muteButton) {
    muteButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      video.muted = !video.muted;
      refresh();
    });
  }

  if (fullscreenButton && box) {
    fullscreenButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (box.requestFullscreen) {
        box.requestFullscreen();
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });

  refresh();
}
