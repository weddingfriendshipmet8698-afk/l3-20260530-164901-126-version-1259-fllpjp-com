(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '×' : '☰';
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('active', current === heroIndex);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('active', current === heroIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showHero(heroIndex + 1);
    }, 5000);
  }

  var grid = document.getElementById('categoryMovieGrid');
  var keywordInput = document.getElementById('categoryKeyword');
  var regionSelect = document.getElementById('categoryRegion');
  var yearSelect = document.getElementById('categoryYear');

  function fillRankingFilters() {
    if (!grid || !regionSelect || !yearSelect || regionSelect.options.length > 1 || yearSelect.options.length > 1) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var regions = [];
    var years = [];
    cards.forEach(function (card) {
      var region = card.getAttribute('data-region') || '';
      var year = card.getAttribute('data-year') || '';
      if (region && regions.indexOf(region) === -1) {
        regions.push(region);
      }
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
    });
    regions.sort().forEach(function (region) {
      var option = document.createElement('option');
      option.value = region;
      option.textContent = region;
      regionSelect.appendChild(option);
    });
    years.sort(function (a, b) { return Number(b) - Number(a); }).forEach(function (year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = year + '年';
      yearSelect.appendChild(option);
    });
  }

  function filterCards() {
    if (!grid) {
      return;
    }
    var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
    var region = regionSelect ? regionSelect.value : '';
    var year = yearSelect ? yearSelect.value : '';
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-tags') || ''
      ].join(' ').toLowerCase();
      var okKeyword = !keyword || text.indexOf(keyword) !== -1;
      var okRegion = !region || card.getAttribute('data-region') === region;
      var okYear = !year || card.getAttribute('data-year') === year;
      card.classList.toggle('is-hidden', !(okKeyword && okRegion && okYear));
    });
  }

  fillRankingFilters();
  [keywordInput, regionSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    }
  });
})();
