document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('book-search-form');
    const searchInput = searchForm.querySelector('input[type="text"]');
    const loader = document.getElementById('loader-container');
    const resultsGrid = document.getElementById('book-grid');

    async function performSearch(query) {
        if (!query) return;

        // 1. Start the Book Animation
        loader.classList.remove('hidden');
        resultsGrid.innerHTML = ''; 

        try {
            // 2. Fetch data from Open Library API
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`);
            const data = await response.json();
            
            // 3. Render the Cards
            data.docs.forEach(book => {
                const card = document.createElement('div');
                card.className = 'book-card';
                card.innerHTML = `
                    <h3>${book.title}</h3>
                    <p>By: ${book.author_name ? book.author_name[0] : 'Unknown Author'}</p>
                    <a href="https://openlibrary.org${book.key}" target="_blank">View Details</a>
                `;
                resultsGrid.appendChild(card);
            });
        } catch (error) {
            resultsGrid.innerHTML = `<p>Error fetching books. Please try again.</p>`;
        } finally {
            // 4. Stop the Book Animation
            loader.classList.add('hidden');
        }
    }

    // Handle Form Submit
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('q', query);
        window.history.pushState({}, '', newUrl);
        performSearch(query);
    });

    // Check URL on Load
    const params = new URLSearchParams(window.location.search);
    if (params.has('q')) {
        const query = params.get('q');
        searchInput.value = query;
        performSearch(query);
    }
});
