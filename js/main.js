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
    scoreMin: Number(document.getElementById("score-min").value),
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



function initDualSlider(containerId, formatter) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const inputs = container.querySelectorAll('.range-slider__input');
  const fill = container.querySelector('.range-slider__fill');
  const display = document.getElementById(`${containerId}-val`);

  const minInput = inputs[0];
  const maxInput = inputs[1];

  function updateUI() {
    let minVal = parseInt(minInput.value);
    let maxVal = parseInt(maxInput.value);

    if (minVal > maxVal) {
      const temp = minVal;
      minVal = maxVal;
      maxVal = temp;
      minInput.value = minVal;
      maxInput.value = maxVal;
    }

    const minPercent = ((minVal - minInput.min) / (minInput.max - minInput.min)) * 100;
    const maxPercent = ((maxVal - maxInput.min) / (maxInput.max - maxInput.min)) * 100;

    fill.style.left = `${minPercent}%`;
    fill.style.width = `${maxPercent - minPercent}%`;

    display.textContent = formatter ? formatter(minVal, maxVal) : `${minVal} - ${maxVal}`;
  }

  minInput.addEventListener('input', updateUI);
  maxInput.addEventListener('input', updateUI);
  updateUI();
}

function initSingleSlider(containerId, formatter) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const input = container.querySelector('.range-slider__input');
  const fill = container.querySelector('.range-slider__fill');
  const display = document.getElementById(`${containerId}-val`);

  function updateUI() {
    const val = parseInt(input.value);
    const percent = ((val - input.min) / (input.max - input.min)) * 100;

    fill.style.left = `0%`;
    fill.style.width = `${percent}%`;

    display.textContent = formatter ? formatter(val) : val;
  }

  input.addEventListener('input', updateUI);
  updateUI(); 
}


function initFilterToggles() {
  const allReleasesCheckbox = document.getElementById("search-all-releases");
  const allCountriesCheckbox = document.getElementById("search-all-countries");

  const countryCheckboxContainer = allCountriesCheckbox.closest(".filter__option");
  const countryDropdown = document.querySelector(".release-dates__country");
  const releaseTypesList = document.querySelector(".filter__options--types");

  allReleasesCheckbox.checked = true;
  allCountriesCheckbox.checked = true;

  function updateVisibility() {
    if (allReleasesCheckbox.checked) {
      countryCheckboxContainer.style.display = "none";
      countryDropdown.style.display = "none";
      releaseTypesList.style.display = "none";
    } else {
      countryCheckboxContainer.style.display = ""; 
      releaseTypesList.style.display = "";

      if (allCountriesCheckbox.checked) {
        countryDropdown.style.display = "none";
      } else {
        countryDropdown.style.display = "";
      }
    }
  }

  allReleasesCheckbox.addEventListener("change", updateVisibility);
  allCountriesCheckbox.addEventListener("change", updateVisibility);

  updateVisibility();
}


function initDatePickers() {
  const dateFields = document.querySelectorAll('.date-field');

  dateFields.forEach(field => {
    const textInput = field.querySelector('.date-input');
    const calendarBtn = field.querySelector('.date-button');
    const hiddenDateInput = field.querySelector('input[type="date"]');

    const openPicker = () => {
      try {
        hiddenDateInput.showPicker();
      } catch (err) {
        hiddenDateInput.click();
      }
    };

    calendarBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openPicker();
    });

    textInput.addEventListener('click', openPicker);

    hiddenDateInput.addEventListener('change', () => {
      textInput.value = hiddenDateInput.value;
    });
  });
}

async function init() {
  initFilterToggles();
  initDatePickers();
  initDualSlider("slider-score", (min, max) => `${min} - ${max}`);
  initDualSlider("slider-runtime", (min, max) => `${min} - ${max} minutes`);
  initSingleSlider("slider-votes", (val) => val);
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

init();
