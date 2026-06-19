(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    var form = document.querySelector('.header-search');
    if (!toggle || !nav || !form) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      form.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var list = document.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }
    var input = document.querySelector('[data-filter-input]');
    var year = document.querySelector('[data-filter-year]');
    var empty = document.querySelector('[data-filter-empty]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region')
        ].join(' ').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var matched = (!keyword || text.indexOf(keyword) !== -1) && (!selectedYear || cardYear === selectedYear);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    apply();
  }

  function initRankings() {
    var tabs = document.querySelector('[data-ranking-tabs]');
    if (!tabs) {
      return;
    }
    var buttons = Array.prototype.slice.call(tabs.querySelectorAll('[data-ranking-tab]'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-ranking-panel]'));
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var name = button.getAttribute('data-ranking-tab');
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        panels.forEach(function (panel) {
          panel.classList.toggle('is-active', panel.getAttribute('data-ranking-panel') === name);
        });
      });
    });
  }

  function createSearchCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-shade"></span>',
      '    <span class="play-mark">▶</span>',
      '    <span class="duration">' + escapeHtml(movie.duration) + '</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="movie-topline">',
      '      <span class="category-pill">' + escapeHtml(movie.category) + '</span>',
      '      <span class="rating">★ ' + escapeHtml(movie.rating) + '</span>',
      '    </div>',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.description) + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function initSearchPage() {
    var mount = document.querySelector('[data-search-results]');
    if (!mount || !window.MOVIE_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.querySelector('[data-page-search-input]');
    var title = document.querySelector('[data-search-title]');
    var subtitle = document.querySelector('[data-search-subtitle]');
    var empty = document.querySelector('[data-search-empty]');
    if (input) {
      input.value = query;
    }
    if (!query) {
      if (empty) {
        empty.classList.remove('is-visible');
      }
      return;
    }
    var lowered = query.toLowerCase();
    var results = window.MOVIE_INDEX.filter(function (movie) {
      var text = [movie.title, movie.description, movie.category, movie.genre, movie.region, movie.type, movie.year, movie.tags].join(' ').toLowerCase();
      return text.indexOf(lowered) !== -1;
    }).slice(0, 240);
    mount.innerHTML = results.map(createSearchCard).join('');
    if (title) {
      title.textContent = '“' + query + '”的搜索结果';
    }
    if (subtitle) {
      subtitle.textContent = results.length ? '为你找到相关影片。' : '没有找到相关影片。';
    }
    if (empty) {
      empty.classList.toggle('is-visible', results.length === 0);
    }
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initRankings();
    initSearchPage();
  });
})();
