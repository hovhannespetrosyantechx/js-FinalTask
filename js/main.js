import { fetchPopularMovies } from './api.js';
import { renderMovies } from './render.js';

const loadMoreBtn = document.querySelector('.load-more');
const filterPanelHeader = document.getElementById("filter-panel-header");
const sortPanelHeader  = document.getElementById("sort-panel-header");


let currentPage = 1;
let totalPages = 1;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const data = await fetchPopularMovies(currentPage);

  renderMovies(data.movies);

  totalPages = data.totalPages;
}



loadMoreBtn.addEventListener('click', async () => {
  if (currentPage >= totalPages) return;

  currentPage++;

  const data = await fetchPopularMovies(currentPage);

  renderMovies(data.movies, true);
});


function togglePanel(header, body) {
  const isOpen = header.classList.contains("filter-panel__header--open");
 
  if (isOpen) {
    header.classList.remove("filter-panel__header--open");
    body.style.display = "none";
  } else {
    header.classList.add("filter-panel__header--open");
    body.style.display = "";
  }
}

sortPanelHeader.addEventListener("click", () => {
  const body = document.getElementById("sort-panel-body");
  togglePanel(sortPanelHeader, body);
});
 
filterPanelHeader.addEventListener("click", () => {
  const body = document.getElementById("filter-panel-body");
  togglePanel(filterPanelHeader, body);
});



// function makeUrl(baseUrl, params){
//     const url = new URL(baseUrl);

//     if (params && typeof params === 'object'){
//         Object.keys(params).forEach(key => {
//             const value = params[key];
            
//             if (value !== null && value !== undefined){
//                 url.searchParams.append(key, value);
//             }
//         });
//     }
// }

// const mycostomurl = makeUrl('http exaple com', {name: 'ashout', age:'30', city:null });
// fetch(mycostomurl)   