/* ./js/details.js */

const getBookId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
};

const titleEl = document.getElementById('book-title');
const authorEl = document.getElementById('book-author');
const descEl = document.getElementById('book-desc');
const loader = document.getElementById('details-loader');

async function loadBookDetails() {
    const id = getBookId();
    if (!id) {
        titleEl.textContent = "No book selected.";
        descEl.innerHTML = `<a href="index.html">Return to search.</a>`;
        if (loader) loader.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`https://openlibrary.org/works/${id}.json`);
        if (!response.ok) throw new Error('Details not found');
        const data = await response.json();

        titleEl.textContent = data.title;
        authorEl.textContent = id; // OpenLibrary 'works' API sometimes requires a separate call for author names
        
        if (data.description) {
            descEl.textContent = typeof data.description === 'string' 
                ? data.description 
                : data.description.value;
        } else {
            descEl.textContent = "No description available for this work.";
        }

    } catch (error) {
        titleEl.textContent = "Book Not Found";
        descEl.innerHTML = `Sorry, we couldn't find those details. <a href="index.html">Return to search</a>`;
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

loadBookDetails();