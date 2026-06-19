import { H as Hls } from './video-player-dru42stk.js';

const players = new WeakMap();

document.querySelectorAll('[data-video-player]').forEach(function (container) {
  const video = container.querySelector('video');
  const button = container.querySelector('.poster-play');
  const status = container.querySelector('.player-status');

  if (!video || !button) {
    return;
  }

  function setStatus(message) {
    if (status) {
      status.textContent = message || '';
    }
  }

  function playVideo() {
    const request = video.play();
    if (request && typeof request.catch === 'function') {
      request.catch(function () {
        setStatus('点击播放器继续播放');
      });
    }
  }

  function initialize() {
    if (players.has(container)) {
      playVideo();
      return;
    }

    const source = video.getAttribute('data-src');
    if (!source) {
      setStatus('播放暂时无法加载，请稍后重试');
      return;
    }

    video.controls = true;
    button.classList.add('is-hidden');
    container.classList.add('is-playing');
    setStatus('正在加载');

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      players.set(container, hls);
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('');
        playVideo();
      });
      hls.on(Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus('网络连接不稳定，正在重试');
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus('播放恢复中');
            hls.recoverMediaError();
          } else {
            setStatus('播放暂时无法加载，请稍后重试');
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      players.set(container, true);
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        setStatus('');
      }, { once: true });
      video.addEventListener('error', function () {
        setStatus('播放暂时无法加载，请稍后重试');
      });
      playVideo();
    } else {
      setStatus('当前浏览器无法播放该影片');
    }
  }

  button.addEventListener('click', initialize);
  video.addEventListener('click', function () {
    if (!players.has(container)) {
      initialize();
    }
  });
});
