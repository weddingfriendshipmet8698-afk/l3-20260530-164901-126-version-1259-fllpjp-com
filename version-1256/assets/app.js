document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var navPanel = document.querySelector("[data-nav-panel]");

    if (menuButton && navPanel) {
        menuButton.addEventListener("click", function () {
            navPanel.classList.toggle("open");
        });
    }

    setupHero();
    setupFilters();
    setupSearchResults();
    setupPlayer();
});

function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;

    function show(nextIndex) {
        if (!slides.length) {
            return;
        }

        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === index);
        });
    }

    if (prev) {
        prev.addEventListener("click", function () {
            show(index - 1);
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            show(index + 1);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            show(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
    });

    window.setInterval(function () {
        show(index + 1);
    }, 6500);
}

function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

    scopes.forEach(function (scope) {
        var input = scope.querySelector("[data-filter-input]");
        var year = scope.querySelector("[data-filter-year]");
        var region = scope.querySelector("[data-filter-region]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

        function apply() {
            var text = input ? input.value.trim().toLowerCase() : "";
            var selectedYear = year ? year.value : "";
            var selectedRegion = region ? region.value : "";

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-year")
                ].join(" ").toLowerCase();
                var matchesText = !text || haystack.indexOf(text) !== -1;
                var matchesYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
                var matchesRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
                card.style.display = matchesText && matchesYear && matchesRegion ? "" : "none";
            });
        }

        [input, year, region].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    });
}

function setupSearchResults() {
    var container = document.getElementById("search-results");
    var input = document.querySelector("[data-search-query]");

    if (!container || !window.MovieIndex) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input) {
        input.value = initialQuery;
        input.addEventListener("input", function () {
            render(input.value);
        });
    }

    render(initialQuery);

    function render(query) {
        var keyword = String(query || "").trim().toLowerCase();
        var items = window.MovieIndex.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.tags,
                movie.description
            ].join(" ").toLowerCase();
            return !keyword || haystack.indexOf(keyword) !== -1;
        }).slice(0, 120);

        if (!items.length) {
            container.innerHTML = '<div class="empty-state">暂无匹配影片</div>';
            return;
        }

        container.innerHTML = items.map(function (movie) {
            return [
                '<article class="movie-card">',
                '    <a class="poster-link" href="./' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
                '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '        <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
                '        <span class="poster-type">' + escapeHtml(movie.type) + '</span>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <a class="movie-title" href="./' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
                '        <p>' + escapeHtml(movie.description) + '</p>',
                '        <div class="meta-row">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</div>',
                '    </div>',
                '</article>'
            ].join("");
        }).join("");
    }
}

function setupPlayer() {
    var player = document.querySelector("[data-player]");
    if (!player) {
        return;
    }

    var video = player.querySelector("video");
    var button = player.querySelector(".play-overlay");
    var hlsInstance = null;

    if (!video) {
        return;
    }

    function attachAndPlay() {
        var stream = video.getAttribute("data-stream");
        if (!stream) {
            return;
        }

        if (!video.getAttribute("data-ready")) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }
            video.setAttribute("data-ready", "true");
        }

        if (button) {
            button.classList.add("is-hidden");
        }

        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener("click", attachAndPlay);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            attachAndPlay();
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
            hlsInstance.destroy();
        }
    });
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
