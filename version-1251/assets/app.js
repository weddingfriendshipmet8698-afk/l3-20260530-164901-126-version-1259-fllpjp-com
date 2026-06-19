(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-button]');
    var nav = qs('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function setActive(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setActive(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        setActive(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setActive(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setActive(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    setActive(0);
    start();
  }

  function initFilters() {
    qsa('[data-filter-box]').forEach(function (box) {
      var textInput = qs('[data-filter-text]', box);
      var yearSelect = qs('[data-filter-year]', box);
      var typeSelect = qs('[data-filter-type]', box);
      var list = qs('[data-filter-list]') || box.parentElement.querySelector('[data-filter-list]');
      var empty = qs('[data-empty-state]') || box.parentElement.querySelector('[data-empty-state]');
      if (!list) {
        return;
      }
      var cards = qsa('[data-card]', list);

      function update() {
        var keyword = (textInput && textInput.value || '').trim().toLowerCase();
        var year = yearSelect && yearSelect.value || '';
        var type = typeSelect && typeSelect.value || '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year')
          ].join(' ').toLowerCase();
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !year || card.getAttribute('data-year') === year;
          var matchType = !type || card.getAttribute('data-type') === type;
          var matched = matchKeyword && matchYear && matchType;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [textInput, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', update);
          control.addEventListener('change', update);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
