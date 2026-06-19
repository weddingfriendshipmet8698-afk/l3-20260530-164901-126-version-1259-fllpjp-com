(function() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function() {
            panel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('img').forEach(function(image) {
        image.addEventListener('error', function() {
            image.classList.add('is-missing');
            image.removeAttribute('src');
        });
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;

        function show(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });

            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        if (prev) {
            prev.addEventListener('click', function() {
                show(active - 1);
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                show(active + 1);
            });
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                show(index);
            });
        });

        setInterval(function() {
            show(active + 1);
        }, 5200);
    }

    var keywordInput = document.getElementById('filter-keyword');
    var yearSelect = document.getElementById('filter-year');
    var typeSelect = document.getElementById('filter-type');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));

    function applyQueryParams() {
        if (!keywordInput) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');

        if (q) {
            keywordInput.value = q;
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }

        var keyword = normalize(keywordInput ? keywordInput.value : '');
        var year = yearSelect ? yearSelect.value : '';
        var type = normalize(typeSelect ? typeSelect.value : '');

        cards.forEach(function(card) {
            var haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.genre,
                card.dataset.tags,
                card.textContent
            ].join(' '));
            var cardYear = card.dataset.year || '';
            var cardType = normalize(card.dataset.type || '');
            var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchYear = !year || cardYear === year;
            var matchType = !type || cardType.indexOf(type) !== -1 || haystack.indexOf(type) !== -1;

            card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchType));
        });
    }

    applyQueryParams();

    [keywordInput, yearSelect, typeSelect].forEach(function(control) {
        if (control) {
            control.addEventListener('input', filterCards);
            control.addEventListener('change', filterCards);
        }
    });

    filterCards();
})();
