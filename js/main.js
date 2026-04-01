import { fetchGenres, fetchMovies, fetchLanguages, fetchKeywordSuggestions, fetchCountries } from "./api.js";
import { renderGenres, renderMovies, showLoadMoreButton, renderLanguages, renderKeywordSuggestions, renderActiveKeywordPills, renderCountries } from "./render.js";
const state = {
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  filters: { sortBy: "popularity.desc", genres: [], releaseDateFrom: "", releaseDateTo: "", scoreMin: 0, minVotes: 0 },
};

let selectedKeywordsData = [];

function collectFilters() {

  const allReleasesChecked = document.getElementById("search-all-releases").checked;
  const allCountriesChecked = document.getElementById("search-all-countries").checked;

  const releaseTypes = !allReleasesChecked
    ? [...document.querySelectorAll('input[name="release-type"]:checked')]
      .map(input => input.value)
    : [];


  const watchRegion = (!allReleasesChecked && !allCountriesChecked)
    ? document.getElementById("release-country").value
    : "";
  const activeGenres = [...document.querySelectorAll(".genre-pill--active")]
    .map((pill) => Number(pill.dataset.genreId));

  const keywordIds = selectedKeywordsData.map(kw => kw.id);

  return {
    searchAllReleases: allReleasesChecked,
    sortBy: document.getElementById("sort-select").value,
    language: document.getElementById("language-select").value,
    genres: activeGenres,
    keywords: keywordIds,
    releaseDateFrom: document.getElementById("date-from").value,
    releaseDateTo: document.getElementById("date-to").value,
    scoreMin: Number(document.getElementById("score-min").value),
    scoreMax: Number(document.getElementById("score-max").value),
    minVotes: Number(document.getElementById("min-votes").value),
    runtimeMin: Number(document.getElementById("runtime-min").value),
    runtimeMax: Number(document.getElementById("runtime-max").value),
    releaseTypes: releaseTypes,          
    watchRegion: watchRegion
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

    console.log("Current Filters:", state.filters);

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

  function updateUI(e) {
    let minVal = parseInt(minInput.value);
    let maxVal = parseInt(maxInput.value);


    if (e && e.target === minInput && minVal > maxVal) {
      minInput.value = maxVal;
      minVal = maxVal;
    } else if (e && e.target === maxInput && maxVal < minVal) {
      maxInput.value = minVal;
      maxVal = minVal;
    }

    if (minVal > (parseInt(minInput.max) / 2)) {
      minInput.style.zIndex = "5";
    } else {
      minInput.style.zIndex = "";
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

      
      allCountriesCheckbox.checked = true;

      document.querySelectorAll('input[name="release-type"]').forEach((checkbox) => {
        checkbox.checked = true;
      });

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


function initKeywordSearch() {
  const input = document.getElementById('keyword-input');
  const suggestionsBox = document.getElementById('keyword-suggestions');
  let timeout = null;

  input.addEventListener('input', (e) => {
    clearTimeout(timeout);
    const query = e.target.value.trim();

    if (query.length < 2) {
      suggestionsBox.style.display = 'none';
      return;
    }

    timeout = setTimeout(async () => {
      try {
        const results = await fetchKeywordSuggestions(query);

        renderKeywordSuggestions(results, (selectedKeyword) => {
          addKeyword(selectedKeyword);
          input.value = '';
          suggestionsBox.style.display = 'none';
        });

      } catch (err) {
        console.error("Failed to fetch keywords", err);
      }
    }, 300);
  });

  function addKeyword(kw) {
    if (!selectedKeywordsData.find(k => k.id === kw.id)) {
      selectedKeywordsData.push(kw);
      refreshKeywordPills();
    }
  }

  function refreshKeywordPills() {
    renderActiveKeywordPills(selectedKeywordsData, (keywordIdToRemove) => {
      selectedKeywordsData = selectedKeywordsData.filter(k => k.id !== keywordIdToRemove);
      refreshKeywordPills();
    });
  }

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = 'none';
    }
  });
}

function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function initCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');

  if (!getCookie("tmdb_consent")) {
    banner.style.display = 'block';
  }

  acceptBtn.addEventListener('click', () => {
    setCookie("tmdb_consent", "true", 365);
    banner.style.display = 'none';
  });
}

async function init() {
  initFilterToggles();
  initDatePickers();
  initKeywordSearch();
  initDualSlider("slider-score", (min, max) => `${min} - ${max}`);
  initDualSlider("slider-runtime", (min, max) => `${min} - ${max} minutes`);
  initSingleSlider("slider-votes", (val) => val);
  initCookieBanner();
  try {
    const [genres, languages, countries] = await Promise.all([
      fetchGenres(),
      fetchLanguages(),
      fetchCountries()
    ]);

    renderGenres(genres);
    renderLanguages(languages);
    renderCountries(countries);
  } catch (err) {
    console.error("Failed to load filter data:", err);
  }
  await loadMovies();
}

document.getElementById("search-btn").addEventListener("click", loadMovies);
document.getElementById("load-more-btn").addEventListener("click", loadMoreMovies);

const burgerBtn = document.getElementById("burger-btn");
const mobileNav = document.getElementById("mobile-nav");
const burgerIcon = document.getElementById("burger-icon");

burgerBtn.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("header__mobile-nav--open");
  burgerBtn.setAttribute("aria-expanded", isOpen);
  mobileNav.setAttribute("aria-hidden", !isOpen);
  burgerIcon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
});

document.addEventListener("click", (e) => {
  if (!burgerBtn.contains(e.target) && !mobileNav.contains(e.target)) {
    mobileNav.classList.remove("header__mobile-nav--open");
    burgerBtn.setAttribute("aria-expanded", "false");
    mobileNav.setAttribute("aria-hidden", "true");
    burgerIcon.className = "fa-solid fa-bars";
  }
});

document.getElementById("sort-panel-header").addEventListener("click", (e) =>
  togglePanel(e.currentTarget, "sort-panel-body"));

document.getElementById("filter-panel-header").addEventListener("click", (e) =>
  togglePanel(e.currentTarget, "filter-panel-body"));

init();