(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.getElementById("heroSlider");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var next = slider.querySelector("[data-hero-next]");
        var prev = slider.querySelector("[data-hero-prev]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 6000);
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        if (slides.length > 1) {
            start();
        }
    }

    function matchesFilter(card, filter) {
        if (!filter || filter === "all") {
            return true;
        }
        if (filter.indexOf("type:") === 0) {
            return card.getAttribute("data-type") === filter.slice(5);
        }
        if (filter.indexOf("year:") === 0) {
            return card.getAttribute("data-year") === filter.slice(5);
        }
        if (filter.indexOf("text:") === 0) {
            var textValue = (card.getAttribute("data-search") || "").toLowerCase();
            return textValue.indexOf(filter.slice(5).toLowerCase()) !== -1;
        }
        return true;
    }

    function setupSearch() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]"));
        scopes.forEach(function (scope) {
            var section = scope.parentElement || document;
            var input = scope.querySelector("[data-search-input]");
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter]"));
            var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
            var activeFilter = "all";

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var ok = (!query || text.indexOf(query) !== -1) && matchesFilter(card, activeFilter);
                    card.classList.toggle("is-hidden", !ok);
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    buttons.forEach(function (item) {
                        item.classList.remove("active");
                    });
                    button.classList.add("active");
                    activeFilter = button.getAttribute("data-filter") || "all";
                    apply();
                });
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
    });
})();
