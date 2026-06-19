(function () {
  var movies = window.SEARCH_MOVIES || [];
  var input = document.querySelector('[data-site-search]');
  var yearSelect = document.querySelector('[data-site-year]');
  var typeSelect = document.querySelector('[data-site-type]');
  var categorySelect = document.querySelector('[data-site-category]');
  var results = document.querySelector('[data-search-results]');
  var empty = document.querySelector('[data-search-empty]');

  if (!input || !results) {
    return;
  }

  function uniqueValues(key) {
    var values = [];
    movies.forEach(function (movie) {
      if (movie[key] && values.indexOf(movie[key]) === -1) {
        values.push(movie[key]);
      }
    });
    return values.sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
  }

  function addOptions(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + movie.url + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-shadow"></span>',
      '<span class="play-pill">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function render() {
    var keyword = input.value.trim().toLowerCase();
    var year = yearSelect && yearSelect.value || '';
    var type = typeSelect && typeSelect.value || '';
    var category = categorySelect && categorySelect.value || '';
    var matched = movies.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' ').toLowerCase();
      return (!keyword || haystack.indexOf(keyword) !== -1) &&
        (!year || movie.year === year) &&
        (!type || movie.type === type) &&
        (!category || movie.category === category);
    }).slice(0, 80);

    results.innerHTML = matched.map(card).join('');
    if (empty) {
      empty.hidden = matched.length !== 0;
    }
  }

  addOptions(yearSelect, uniqueValues('year'));
  addOptions(typeSelect, uniqueValues('type'));
  addOptions(categorySelect, uniqueValues('category'));

  [input, yearSelect, typeSelect, categorySelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    }
  });

  render();
})();
