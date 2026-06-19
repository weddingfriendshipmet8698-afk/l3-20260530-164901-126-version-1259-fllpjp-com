function createMoviePlayer(source) {
    var frame = document.querySelector('[data-player]');

    if (!frame) {
        return;
    }

    var video = frame.querySelector('video');
    var playButton = frame.querySelector('[data-play]');
    var errorBox = frame.querySelector('[data-player-error]');
    var prepared = false;
    var hls = null;

    function showError() {
        if (errorBox) {
            errorBox.textContent = '播放加载失败，请稍后再试';
        }
    }

    function prepare() {
        if (prepared || !video) {
            return;
        }

        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, function(event, data) {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                    return;
                }

                if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                    return;
                }

                showError();
            });
        } else {
            video.src = source;
        }
    }

    function play() {
        prepare();
        frame.classList.add('is-playing');
        video.controls = true;

        var result = video.play();

        if (result && typeof result.catch === 'function') {
            result.catch(function() {
                frame.classList.remove('is-playing');
                showError();
            });
        }
    }

    if (playButton) {
        playButton.addEventListener('click', play);
    }

    if (video) {
        video.addEventListener('click', function() {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener('error', showError);
    }

    window.addEventListener('beforeunload', function() {
        if (hls) {
            hls.destroy();
        }
    });
}
