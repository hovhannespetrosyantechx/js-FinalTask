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

export function showLoadMoreButton(visible) {
  document.getElementById("load-more-btn").style.display = visible ? "block" : "none";
}