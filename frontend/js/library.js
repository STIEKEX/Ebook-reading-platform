// Library page functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!isLoggedIn()) {
        window.location.href = '/pages/login.html';
        return;
    }

    // Load user's library
    loadLibrary();

    // Set up filters
    setupFilters();
});

async function loadLibrary() {
    try {
        const books = await getLibrary();
        displayBooks(books);
    } catch (error) {
        console.error('Error loading library:', error);
        showError('Failed to load your library');
    }
}

function displayBooks(books) {
    const container = document.querySelector('.library-grid');
    if (!container) return;

    if (!books.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-library'></i>
                <h3>Your library is empty</h3>
                <p>Add books to your library to see them here</p>
                <button onclick="window.location.href='../main.html'" class="btn btn-primary">
                    Browse Books
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = books.map(book => `
        <div class="book-card" data-id="${book._id}">
            <div class="book-cover">
                <img src="${book.coverImage}" alt="${book.title}">
                <button class="remove-btn" onclick="removeBook('${book._id}', event)">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <div class="book-meta">
                    <span class="category">${book.category}</span>
                    <span class="format">${book.fileType || 'PDF'}</span>
                </div>
                <div class="book-actions">
                    <button onclick="continueReading('${book._id}')" class="btn btn-primary">
                        <i class='bx bx-book-open'></i>
                        Continue Reading
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function removeBook(bookId, event) {
    event.stopPropagation(); // Prevent triggering parent click events

    if (!confirm('Remove this book from your library?')) return;

    try {
        await removeFromLibrary(bookId);
        loadLibrary(); // Reload the library
        showNotification('Book removed from library');
    } catch (error) {
        console.error('Error removing book:', error);
        showNotification('Failed to remove book', 'error');
    }
}

function continueReading(bookId) {
    window.location.href = `reader-new.html?id=${bookId}`;
}

function setupFilters() {
    const searchInput = document.querySelector('#searchInput');
    const categorySelect = document.querySelector('#categoryFilter');
    const sortSelect = document.querySelector('#sortBy');

    if (!searchInput || !categorySelect || !sortSelect) return;

    const filterBooks = async () => {
        try {
            let books = await getLibrary();

            // Apply search filter
            const searchTerm = searchInput.value.toLowerCase();
            if (searchTerm) {
                books = books.filter(book =>
                    book.title.toLowerCase().includes(searchTerm) ||
                    book.author.toLowerCase().includes(searchTerm)
                );
            }

            // Apply category filter
            const category = categorySelect.value;
            if (category) {
                books = books.filter(book => book.category === category);
            }

            // Apply sorting
            const sortBy = sortSelect.value;
            books.sort((a, b) => {
                switch (sortBy) {
                    case 'title':
                        return a.title.localeCompare(b.title);
                    case 'author':
                        return a.author.localeCompare(b.author);
                    case 'recent':
                        return new Date(b.addedToLibrary) - new Date(a.addedToLibrary);
                    default:
                        return 0;
                }
            });

            displayBooks(books);
        } catch (error) {
            console.error('Error filtering books:', error);
        }
    };

    // Add event listeners
    searchInput.addEventListener('input', debounce(filterBooks, 300));
    categorySelect.addEventListener('change', filterBooks);
    sortSelect.addEventListener('change', filterBooks);
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showError(message) {
    const container = document.querySelector('.library-grid');
    if (!container) return;

    container.innerHTML = `
        <div class="error-state">
            <i class='bx bx-error-circle'></i>
            <h3>Oops!</h3>
            <p>${message}</p>
            <button onclick="loadLibrary()" class="btn btn-primary">
                Try Again
            </button>
        </div>
    `;
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}