const API_KEY = "cb06102e586da46793f6b9ae230beb25";
const BASE_URL = "https://api.themoviedb.org/3";

async function apiFetch(endpoint, params = {}) {
  const query = new URLSearchParams({ api_key: API_KEY, language: "en-US", ...params });
  const res = await fetch(`${BASE_URL}${endpoint}?${query}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function fetchGenres() {
  const data = await apiFetch("/genre/movie/list");
  return data.genres;
}

export async function fetchLanguages() {
  return await apiFetch("/configuration/languages");
}

export async function fetchKeywordSuggestions(query) {
  const data = await apiFetch("/search/keyword", { query, page: 1 });
  return data.results; 
}

export async function fetchMovies(filters, page = 1) {
  const params = { sort_by: filters.sortBy, page };

  if (filters.genres.length) {
    params.with_genres = filters.genres.join(",");
  }
  if (filters.language) {
    params.with_original_language = filters.language;
  }
  if (filters.keywords && filters.keywords.length > 0) {
    params.with_keywords = filters.keywords.join(",");
  }
  if (filters.releaseTypes && filters.releaseTypes.length > 0) {
    params.with_release_type = filters.releaseTypes.join("|");
  }
  if (filters.watchRegion) {
    params.region = filters.watchRegion;
  }
  if (filters.releaseDateFrom) {
    params["primary_release_date.gte"] = filters.releaseDateFrom;
  }
  if (filters.releaseDateTo) {
    params["primary_release_date.lte"] = filters.releaseDateTo;
  }
  if (filters.scoreMin > 0) {
    params["vote_average.gte"] = filters.scoreMin;
  }
  if (filters.scoreMax > 0 && filters.scoreMax < 10) {
    params["vote_average.lte"] = filters.scoreMax;
  }
  if (filters.minVotes > 0) {
    params["vote_count.gte"] = filters.minVotes;
  }
  if (filters.runtimeMin > 0) {
    params["with_runtime.gte"] = filters.runtimeMin;
  }
  if (filters.runtimeMax > 0 && filters.runtimeMax < 400) {
    params["with_runtime.lte"] = filters.runtimeMax;
  }

  const data = await apiFetch("/discover/movie", params);
  return { movies: data.results, totalPages: data.total_pages };
}
