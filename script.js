/* js/main.js */
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('book-search-form');
    const searchInput = document.getElementById('search-term'); // Use the ID-based selector
    const loader = document.getElementById('loader-container');
    const resultsGrid = document.getElementById('book-grid');
    const lastSearchDisplay = document.querySelector('#last-search span');

    // --- 1. Local Storage Implementation ---
    // Function to update the footer with the saved search
    const updateLastSearchUI = () => {
        const savedSearch = localStorage.getItem('bookQuest_lastSearch');
        if (savedSearch) {
            lastSearchDisplay.textContent = savedSearch;
        }
    };

    async function performSearch(query) {
        if (!query) return;

        // Save to Local Storage
        localStorage.setItem('bookQuest_lastSearch', query);
        updateLastSearchUI();

        // Start Animation (UX)
        if (loader) loader.classList.remove('hidden');
        resultsGrid.innerHTML = ''; 

        try {
            // Data Fetching
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`);
            const data = await response.json();
            
            if (data.docs.length === 0) {
                resultsGrid.innerHTML = `<p>No books found for "${query}".</p>`;
                return;
            }

            // Render Results
            data.docs.forEach(book => {
                const card = document.createElement('div');
                card.className = 'book-card';
                // Using URL Parameters for the details link
                card.innerHTML = `
                    <h3>${book.title}</h3>
                    <p>By: ${book.author_name ? book.author_name[0] : 'Unknown Author'}</p>
                    <a href="details.html?id=${book.key.split('/').pop()}">View Details</a>
                `;
                resultsGrid.appendChild(card);
            });
        } catch (error) {
            resultsGrid.innerHTML = `<p>Error fetching books. Please try again.</p>`;
        } finally {
            if (loader) loader.classList.add('hidden');
        }
    }

    // --- 2. Handle Form Submit ---
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (!query) return;

        // URL Parameters logic
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('q', query);
        window.history.pushState({}, '', newUrl);
        
        performSearch(query);
    });

    // --- 3. Initialization Logic ---
    // Check URL Parameters on Load
    const params = new URLSearchParams(window.location.search);
    if (params.has('q')) {
        const query = params.get('q');
        searchInput.value = query;
        performSearch(query);
    }

    // Always check Local Storage on load to show "Last Search"
    updateLastSearchUI();
});
