import { fetchGenres, fetchMovies } from "./api.js";
import { renderGenres, renderMovies, showLoadMoreButton } from "./render.js";

const state = {
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  filters: { sortBy: "popularity.desc", genres: [], releaseDateFrom: "", releaseDateTo: "", scoreMin: 0, minVotes: 0 },
};

function collectFilters() {
  const activeGenres = [...document.querySelectorAll(".genre-pill--active")]
    .map((pill) => Number(pill.dataset.genreId));

  const releaseTypes = [...document.querySelectorAll('input[name="release-type"]:checked')]
    .map(input => input.value);

  return {
    sortBy: document.getElementById("sort-select").value,
    genres: activeGenres,
    releaseDateFrom: document.getElementById("date-from").value,
    releaseDateTo: document.getElementById("date-to").value,
    scoreMin: Number(document.getElementById("score-from").value),
    minVotes: Number(document.getElementById("min-votes").value),
    releaseTypes: releaseTypes,
    watchRegion: document.getElementById("release-country").value,
  };
}

function togglePanel(header, bodyId) {
  const body = document.getElementById(bodyId);
  const isOpen = header.classList.contains("filter-panel__header--open");
  header.classList.toggle("filter-panel__header--open", !isOpen);
  body.style.display = isOpen ? "none" : "";
}

async function loadMovies() {
  if (state.isLoading) return;
  state.isLoading = true;

  try {
    state.filters = collectFilters();
    state.currentPage = 1;

    const { movies, totalPages } = await fetchMovies(state.filters, 1);
    state.totalPages = totalPages;

    renderMovies(movies, false);
    showLoadMoreButton(totalPages > 1);
  } catch (err) {
    console.error("Failed to load movies:", err);
    document.getElementById("movie-grid").innerHTML =
      `<p class="movie-grid__empty">Something went wrong. Please try again.</p>`;
  } finally {
    state.isLoading = false;
  }
}

async function loadMoreMovies() {
  if (state.isLoading || state.currentPage >= state.totalPages) return;
  state.isLoading = true;

  const btn = document.getElementById("load-more-btn");
  btn.textContent = "Loading…";

  try {
    state.currentPage++;
    const { movies, totalPages } = await fetchMovies(state.filters, state.currentPage);
    state.totalPages = totalPages;

    renderMovies(movies, true);
    showLoadMoreButton(state.currentPage < state.totalPages);
  } catch (err) {
    console.error("Failed to load more:", err);
  } finally {
    state.isLoading = false;
    btn.textContent = "Load More";
  }
}

async function init() {
  try {
    const genres = await fetchGenres();
    renderGenres(genres);
  } catch (err) {
    console.error("Failed to load genres:", err);
  }
  await loadMovies();
}

document.getElementById("search-btn").addEventListener("click", loadMovies);
document.getElementById("load-more-btn").addEventListener("click", loadMoreMovies);

document.getElementById("sort-panel-header").addEventListener("click", (e) =>
  togglePanel(e.currentTarget, "sort-panel-body"));

document.getElementById("filter-panel-header").addEventListener("click", (e) =>
  togglePanel(e.currentTarget, "filter-panel-body"));

document.getElementById("score-from").addEventListener("input", (e) => {
  const val = Number(e.target.value);
  document.getElementById("score-from-val").textContent = val === 0 ? "0 - 10" : `${val} - 10`;
});

document.getElementById("min-votes").addEventListener("input", (e) => {
  document.getElementById("min-votes-val").textContent = e.target.value;
});

init();

