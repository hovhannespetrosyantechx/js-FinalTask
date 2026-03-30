const API_KEY = "cb06102e586da46793f6b9ae230beb25"; 
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export async function fetchPopularMovies(page = 1, sort = 'popularity.desc') {
  try {
    const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch movies');
    }

    const data = await response.json();

    return {
      movies: data.results,
      totalPages: data.total_pages
    };

  } catch (error) {
    console.error(error);
    return { movies: [], totalPages: 0 };
  }
}