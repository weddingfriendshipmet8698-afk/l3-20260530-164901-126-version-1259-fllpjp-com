(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const topButton = document.querySelector('[data-back-top]');
  if (topButton) {
    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-search-input]').forEach(function (input) {
    const section = input.closest('section') || document;
    const list = section.querySelector('[data-movie-list]');
    const result = section.querySelector('[data-filter-result]');
    const buttons = Array.from(section.querySelectorAll('[data-filter-value]'));

    if (!list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll('[data-card]'));
    let activeFilter = 'all';

    function apply() {
      const keyword = input.value.trim().toLowerCase();
      let visible = 0;

      cards.forEach(function (card) {
        const search = (card.getAttribute('data-search') || '').toLowerCase();
        const filter = (card.getAttribute('data-filter') || '').toLowerCase();
        const matchesKeyword = !keyword || search.indexOf(keyword) !== -1 || filter.indexOf(keyword) !== -1;
        const matchesFilter = activeFilter === 'all' || filter.indexOf(activeFilter.toLowerCase()) !== -1 || search.indexOf(activeFilter.toLowerCase()) !== -1;
        const shouldShow = matchesKeyword && matchesFilter;
        card.classList.toggle('is-hidden-by-filter', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (result) {
        result.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    input.addEventListener('input', apply);

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = button.getAttribute('data-filter-value') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    });

    apply();
  });
})();
