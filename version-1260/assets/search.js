(function () {
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';

  if (input) {
    input.value = query;
  }

  function createResult(movie) {
    var article = document.createElement('article');
    article.className = 'ranking-card';
    article.innerHTML = [
      '<a href="' + movie.url + '">',
      '<span class="ranking-index">▶</span>',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<div>',
      '<h2>' + escapeHtml(movie.title) + '</h2>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="meta-row">',
      '<span>' + escapeHtml(movie.region) + '</span>',
      '<span>' + escapeHtml(String(movie.year)) + '年</span>',
      '<span>' + escapeHtml(movie.category) + '</span>',
      '</div>',
      '</div>',
      '</a>'
    ].join('');
    return article;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function render() {
    if (!results) {
      return;
    }
    results.innerHTML = '';
    var normalized = query.trim().toLowerCase();
    if (!normalized) {
      results.innerHTML = '<div class="search-empty">请输入关键词开始搜索。</div>';
      return;
    }
    var matched = (window.MOVIE_SEARCH_DATA || []).filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.category, movie.oneLine].concat(movie.tags || []).join(' ').toLowerCase();
      return text.indexOf(normalized) !== -1;
    }).slice(0, 120);
    if (!matched.length) {
      results.innerHTML = '<div class="search-empty">未找到相关影片。</div>';
      return;
    }
    matched.forEach(function (movie) {
      results.appendChild(createResult(movie));
    });
  }

  render();
})();
