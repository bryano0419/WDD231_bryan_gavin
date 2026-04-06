/* ./script.js */

// --- 1. Constants & Logic ---
// These are scoped to this module file only
const STORAGE_KEY = 'bookQuest_lastSearch';

const saveSearch = (query) => localStorage.setItem(STORAGE_KEY, query);
const getLastSearch = () => localStorage.getItem(STORAGE_KEY);

/**
 * Data Fetching Logic
 */
async function fetchBooks(query) {
    const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`
    );
    if (!response.ok) throw new Error('Fetch failed');
    return await response.json();
}

// --- 2. DOM Elements ---
const searchForm = document.getElementById('book-search-form');
const searchInput = document.getElementById('search-term');
const loader = document.getElementById('loader-container');
const resultsGrid = document.getElementById('book-grid');
const lastSearchDisplay = document.querySelector('#last-search span');

// --- 3. UI Functions ---
const updateLastSearchUI = () => {
    const savedSearch = getLastSearch();
    if (savedSearch && lastSearchDisplay) {
        lastSearchDisplay.textContent = savedSearch;
    }
};

const renderBooks = (books) => {
    resultsGrid.innerHTML = ''; // Clear previous
    books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <h3>${book.title}</h3>
            <p>By: ${book.author_name ? book.author_name[0] : 'Unknown Author'}</p>
            <a href="details.html?id=${book.key.split('/').pop()}">View Details</a>
        `;
        resultsGrid.appendChild(card);
    });
};

/**
 * Main Orchestrator
 */
async function performSearch(query) {
    if (!query) return;

    saveSearch(query);
    updateLastSearchUI();

    if (loader) loader.classList.remove('hidden');
    
    try {
        const data = await fetchBooks(query);
        if (data.docs.length === 0) {
            resultsGrid.innerHTML = `<p>No books found for "${query}".</p>`;
        } else {
            renderBooks(data.docs);
        }
    } catch (error) {
        resultsGrid.innerHTML = `<p>Error fetching books. Please try again.</p>`;
    } finally {
        if (loader) loader.classList.add('hidden');
    }
}

// --- 4. Event Listeners ---
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    // Update URL without reloading
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('q', query);
    window.history.pushState({}, '', newUrl);
    
    performSearch(query);
});

// --- 5. Initialization ---
const init = () => {
    // Check URL for existing search
    const params = new URLSearchParams(window.location.search);
    if (params.has('q')) {
        const query = params.get('q');
        searchInput.value = query;
        performSearch(query);
    }
    updateLastSearchUI();
};

init();
