(function () {
  function text(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupCarousel() {
    var root = document.querySelector('[data-carousel]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupSearch() {
    var area = document.querySelector('[data-filter-area]');
    if (!area) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var keyword = area.querySelector('[data-filter-keyword]');
    var region = area.querySelector('[data-filter-region]');
    var type = area.querySelector('[data-filter-type]');
    var year = area.querySelector('[data-filter-year]');
    var status = document.querySelector('[data-result-status]');
    var params = new URLSearchParams(window.location.search);

    if (keyword && params.get('q')) {
      keyword.value = params.get('q');
    }

    function match(card) {
      var q = keyword ? text(keyword.value) : '';
      var r = region ? text(region.value) : '';
      var t = type ? text(type.value) : '';
      var y = year ? text(year.value) : '';
      var body = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.category,
        card.dataset.year
      ].join(' ').toLowerCase();
      if (q && body.indexOf(q) === -1) {
        return false;
      }
      if (r && text(card.dataset.region).indexOf(r) === -1) {
        return false;
      }
      if (t && text(card.dataset.type).indexOf(t) === -1) {
        return false;
      }
      if (y && text(card.dataset.year) !== y) {
        return false;
      }
      return true;
    }

    function apply() {
      var total = 0;
      cards.forEach(function (card) {
        var visible = match(card);
        card.classList.toggle('is-hidden', !visible);
        if (visible) {
          total += 1;
        }
      });
      if (status) {
        status.textContent = '当前匹配 ' + total + ' 部内容';
      }
    }

    [keyword, region, type, year].forEach(function (field) {
      if (field) {
        field.addEventListener('input', apply);
        field.addEventListener('change', apply);
      }
    });
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupCarousel();
    setupSearch();
  });
}());
