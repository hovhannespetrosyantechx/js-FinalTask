const movieGrid = document.querySelector('.movie-grid');

export function renderMovies(movies, append = false) {
    if (!append) {
        movieGrid.innerHTML = '';
    }

    movies.forEach(movie => {
        const card = document.createElement('div');
        card.classList.add('movie-card');

        const image = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : '';

        card.innerHTML = `
      <img src="${image}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>${movie.release_date}</p>
      <span>${movie.vote_average}</span>
    `;

        movieGrid.appendChild(card);
    });
}