const IMG_BASE_URL = "https://image.tmdb.org/t/p/w300";

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
    const date  = movie.release_date
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