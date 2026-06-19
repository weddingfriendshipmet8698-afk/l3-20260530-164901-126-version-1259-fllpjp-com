const MovieSite = (() => {
  const select = (selector, root = document) => root.querySelector(selector);
  const selectAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const escapeHTML = (value) => String(value || "").replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[char]);

  const initNav = () => {
    const toggle = select("[data-nav-toggle]");
    const menu = select("[data-nav-menu]");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  };

  const initHero = () => {
    const hero = select("[data-hero]");

    if (!hero) {
      return;
    }

    const slides = selectAll("[data-hero-slide]", hero);
    const dots = selectAll("[data-hero-dot]", hero);
    const prev = select("[data-hero-prev]", hero);
    const next = select("[data-hero-next]", hero);
    let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
    let timer = null;

    const show = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle("is-active", i === index);
        slide.setAttribute("aria-hidden", i === index ? "false" : "true");
      });
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    };

    const play = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 5600);
    };

    if (slides.length < 2) {
      return;
    }

    prev?.addEventListener("click", () => {
      show(index - 1);
      play();
    });

    next?.addEventListener("click", () => {
      show(index + 1);
      play();
    });

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        show(i);
        play();
      });
    });

    play();
  };

  const initFilters = () => {
    selectAll("[data-filter-scope]").forEach((scope) => {
      const search = select("[data-card-search]", scope);
      const year = select("[data-year-filter]", scope);
      const reset = select("[data-filter-reset]", scope);
      const list = select("[data-card-list]", scope.parentElement || document) || select("[data-card-list]");
      const empty = select("[data-no-results]", scope.parentElement || document);

      if (!list) {
        return;
      }

      const cards = selectAll("[data-card]", list);

      const apply = () => {
        const keyword = (search?.value || "").trim().toLowerCase();
        const selectedYear = year?.value || "";
        let visible = 0;

        cards.forEach((card) => {
          const haystack = [
            card.dataset.title,
            card.dataset.genre,
            card.dataset.region,
            card.dataset.year
          ].join(" ").toLowerCase();
          const matchText = !keyword || haystack.includes(keyword);
          const matchYear = !selectedYear || card.dataset.year === selectedYear;
          const shouldShow = matchText && matchYear;

          card.hidden = !shouldShow;
          visible += shouldShow ? 1 : 0;
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      };

      search?.addEventListener("input", apply);
      year?.addEventListener("change", apply);
      reset?.addEventListener("click", () => {
        if (search) {
          search.value = "";
        }
        if (year) {
          year.value = "";
        }
        apply();
      });
    });
  };

  const renderSearch = () => {
    const host = select("[data-search-results]");

    if (!host || !window.MovieSearchIndex) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const keyword = (params.get("q") || "").trim();
    const input = select("[data-search-input]");
    const heading = select("[data-search-heading]");
    const summary = select("[data-search-summary]");

    if (input) {
      input.value = keyword;
    }

    const source = window.MovieSearchIndex;
    const normalized = keyword.toLowerCase();
    const results = normalized
      ? source.filter((item) => [item.title, item.genre, item.region, item.year, item.category].join(" ").toLowerCase().includes(normalized)).slice(0, 120)
      : source.slice(0, 48);

    if (heading) {
      heading.textContent = keyword ? `“${keyword}”相关影片` : "精选影片";
    }

    if (summary) {
      summary.textContent = keyword ? "根据片名、题材、地区与年份匹配片库内容。" : "可直接搜索片名、地区、年份或题材。";
    }

    host.innerHTML = results.length
      ? results.map((item) => `
        <article class="movie-card" data-card>
          <a class="poster-link" href="${escapeHTML(item.url)}" aria-label="观看${escapeHTML(item.title)}">
            <img src="${escapeHTML(item.cover)}" alt="${escapeHTML(item.title)}" loading="lazy">
            <span class="poster-shade"></span>
            <span class="play-chip">▶</span>
            <span class="duration-chip">${escapeHTML(item.duration)}</span>
          </a>
          <div class="movie-card-body">
            <div class="meta-row">
              <span>${escapeHTML(item.year)}</span>
              <span>${escapeHTML(item.region)}</span>
              <span>${escapeHTML(item.category)}</span>
            </div>
            <h2><a href="${escapeHTML(item.url)}">${escapeHTML(item.title)}</a></h2>
            <p>${escapeHTML(item.description)}</p>
            <div class="card-foot">
              <span class="score">★ ${escapeHTML(item.rating)}</span>
              <span>${escapeHTML(item.genre)}</span>
            </div>
          </div>
        </article>
      `).join("")
      : `<p class="no-results">未找到相关影片</p>`;
  };

  const initPlayer = (source) => {
    const video = select("[data-player-video]");
    const layer = select("[data-play-layer]");
    const button = select("[data-play-button]");

    if (!video || !source) {
      return;
    }

    let prepared = false;
    let hlsInstance = null;

    const prepare = () => {
      if (prepared) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      video.controls = true;
      prepared = true;
    };

    const play = () => {
      prepare();
      layer?.classList.add("is-hidden");
      const promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
          layer?.classList.remove("is-hidden");
        });
      }
    };

    layer?.addEventListener("click", play);
    button?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      play();
    });
    video.addEventListener("click", () => {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("pagehide", () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  const initAll = () => {
    initNav();
    initHero();
    initFilters();
    renderSearch();
  };

  document.addEventListener("DOMContentLoaded", initAll);

  return {
    initAll,
    initPlayer
  };
})();
