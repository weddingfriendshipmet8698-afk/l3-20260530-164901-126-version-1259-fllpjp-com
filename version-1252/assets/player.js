(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function attach(shell) {
        var video = shell.querySelector("video");
        var button = shell.querySelector("[data-play-toggle]");
        if (!video || !button) {
            return;
        }
        var streamUrl = video.getAttribute("data-hls");
        var bound = false;

        function bindStream() {
            if (bound || !streamUrl) {
                return;
            }
            bound = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                shell.hlsInstance = hls;
                return;
            }
            video.src = streamUrl;
        }

        function play() {
            bindStream();
            shell.classList.add("is-playing");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    shell.classList.remove("is-playing");
                });
            }
        }

        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!bound) {
                play();
            }
        });
        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            if (!video.currentTime) {
                shell.classList.remove("is-playing");
            }
        });
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll("[data-video-shell]")).forEach(attach);
    });
})();
