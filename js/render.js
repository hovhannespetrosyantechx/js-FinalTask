const IMG_BASE_URL = "https://image.tmdb.org/t/p/w300";


function getRatingColors(score) {
  if (score >= 7) return { bar: "#21d07a", track: "#204529" }; // Green
  if (score >= 4) return { bar: "#d2d531", track: "#423d0f" }; // Yellow/Lime
  if (score > 0) return { bar: "#db2360", track: "#571435" }; // Red
  return { bar: "#666666", track: "#333333" };
}

function buildRatingSvg(score) {
  const r = 18;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 10);
  const colors = getRatingColors(score);

  return `
    <svg class="movie-card__rating-svg" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="${r}" fill="none" stroke="${colors.track}" stroke-width="2.5"/>
      <circle cx="20" cy="20" r="${r}" fill="none"
        stroke="${colors.bar}" stroke-width="2.5"
        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
        stroke-linecap="round"/>
    </svg>`;
}
export function renderGenres(genres) {
  const list = document.getElementById("genre-list");
  list.innerHTML = "";

  genres.forEach((genre) => {
    const li = document.createElement("li");
    li.className = "genre-pill";
    li.dataset.genreId = genre.id;
    li.textContent = genre.name;
    li.addEventListener("click", () => li.classList.toggle("genre-pill--active"));
    list.appendChild(li);
  });
}

export function renderLanguages(languages) {
  const select = document.getElementById("language-select");
  
  const sortedLanguages = languages.sort((a, b) => 
    a.english_name.localeCompare(b.english_name)
  );

  sortedLanguages.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang.iso_639_1;
    option.textContent = lang.english_name;
    select.appendChild(option);
  });
}

export function renderMovies(movies, append = false) {
  const grid = document.getElementById("movie-grid");
  if (!append) grid.innerHTML = "";

  if (!append && movies.length === 0) {
    grid.innerHTML = `<p class="movie-grid__empty">No movies found. Try adjusting your filters.</p>`;
    return;
  }

  movies.forEach((movie) => {
    const score = Math.round(movie.vote_average * 10) / 10;
    const displayScore = score > 0 ? Math.round(score * 10) : "NR";
    const percentSymbol = score > 0 ? `<sup class="percent-symbol">%</sup>` : "";
    const date = movie.release_date
      ? new Date(movie.release_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "Unknown";

    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
      <div class="movie-card__poster-wrapper">
        ${movie.poster_path
        ? `<img class="movie-card__poster" src="${IMG_BASE_URL}${movie.poster_path}" alt="${movie.title}" loading="lazy"/>`
        : `<div class="movie-card__poster--placeholder"><i class="fa-solid fa-film"></i></div>`}
      </div>
      <button class="movie-card__options" aria-label="Open options menu">
        <i class="fa-solid fa-ellipsis"></i>
      </button>
      <div class="movie-card__rating">
        ${buildRatingSvg(score)}
        <span class="movie-card__rating-value">
          ${displayScore}${percentSymbol}
        </span>
      </div>
      <div class="movie-card__body">
        <p class="movie-card__title">${movie.title}</p>
        <p class="movie-card__date">${date}</p>
      </div>`;

    grid.appendChild(card);
  });
}

export function renderKeywordSuggestions(keywords, onSelectCallback) {
  const suggestionsBox = document.getElementById('keyword-suggestions');
  suggestionsBox.innerHTML = '';

  if (!keywords || keywords.length === 0) {
    suggestionsBox.style.display = 'none';
    return;
  }

  keywords.forEach(kw => {
    const li = document.createElement('li');
    li.className = 'keyword-suggestion-item';
    li.textContent = kw.name;
    
    li.addEventListener('click', () => onSelectCallback(kw));
    
    suggestionsBox.appendChild(li);
  });
  
  suggestionsBox.style.display = 'block';
}

export function renderActiveKeywordPills(selectedKeywordsData, onRemoveCallback) {
  const selectedBox = document.getElementById('selected-keywords');
  selectedBox.innerHTML = '';

  selectedKeywordsData.forEach(kw => {
    const li = document.createElement('li');
    li.className = 'keyword-pill keyword-pill--active'; 
    li.innerHTML = `${kw.name} <i class="fa-solid fa-xmark"></i>`;
    
    li.addEventListener('click', () => onRemoveCallback(kw.id));
    
    selectedBox.appendChild(li);
  });
}



function getFlagEmoji(iso) {
  if (!iso || iso.length !== 2) return "";
  return String.fromCodePoint(
    ...iso.toUpperCase().split("").map((char) => 0x1F1E6 + char.charCodeAt(0) - 65)
  );
}

export function renderCountries(countries) {
  const select = document.getElementById("release-country");
  if (!select) return;

  select.innerHTML = "";

  const sortedCountries = [...countries].sort((a, b) =>
    a.english_name.localeCompare(b.english_name)
  );

  sortedCountries.forEach((country) => {
    const option = document.createElement("option");
    option.value = country.iso_3166_1;

    const flag = getFlagEmoji(country.iso_3166_1);
    option.textContent = `${flag} ${country.english_name}`;

    select.appendChild(option);
  });

}

export function showLoadMoreButton(visible) {
  document.getElementById("load-more-btn").style.display = visible ? "block" : "none";
}

