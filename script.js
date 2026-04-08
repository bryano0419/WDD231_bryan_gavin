/* ./script.js */

const STORAGE_KEY = 'bookQuest_lastSearch';

const saveSearch = (query) => localStorage.setItem(STORAGE_KEY, query);
const getLastSearch = () => localStorage.getItem(STORAGE_KEY);

const searchForm = document.getElementById('book-search-form');
const searchInput = document.getElementById('search-term');
const genreFilter = document.getElementById('genre-filter');
const loader = document.getElementById('loader-container');
const resultsGrid = document.getElementById('book-grid');
const lastSearchDisplay = document.querySelector('#last-search span');

async function fetchBooks(query, genre) {
    let url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;
    if (genre !== 'all') {
        url += `&subject=${encodeURIComponent(genre)}`;
    }
    url += `&limit=12`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Fetch failed');
    return await response.json();
}

const renderBooks = (books) => {
    resultsGrid.innerHTML = ''; 
    books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        // split('/').pop() gets the ID from /works/OL12345W
        const bookId = book.key ? book.key.split('/').pop() : 'unknown';
        
        card.innerHTML = `
            <h3>${book.title}</h3>
            <p>By: ${book.author_name ? book.author_name[0] : 'Unknown Author'}</p>
            <a href="details.html?id=${bookId}">View Details</a>
        `;
        resultsGrid.appendChild(card);
    });
};

async function performSearch(query, genre = 'all') {
    if (!query) return;

    saveSearch(query);
    if (lastSearchDisplay) lastSearchDisplay.textContent = query;

    if (loader) loader.classList.remove('hidden');
    resultsGrid.innerHTML = ''; 
    
    try {
        const data = await fetchBooks(query, genre);
        if (!data.docs || data.docs.length === 0) {
            resultsGrid.innerHTML = `<p class="placeholder-text">No books found for "${query}" in this category.</p>`;
        } else {
            renderBooks(data.docs);
        }
    } catch (error) {
        resultsGrid.innerHTML = `<p class="placeholder-text">Error fetching books. Please check your connection.</p>`;
    } finally {
        if (loader) loader.classList.add('hidden');
    }
}

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    const genre = genreFilter.value;

    const newUrl = new URL(window.location);
    newUrl.searchParams.set('q', query);
    newUrl.searchParams.set('genre', genre);
    window.history.pushState({}, '', newUrl);
    
    performSearch(query, genre);
});

const init = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('q')) {
        const query = params.get('q');
        const genre = params.get('genre') || 'all';
        searchInput.value = query;
        genreFilter.value = genre;
        performSearch(query, genre);
    }
    const saved = getLastSearch();
    if (saved && lastSearchDisplay) lastSearchDisplay.textContent = saved;
};

init();