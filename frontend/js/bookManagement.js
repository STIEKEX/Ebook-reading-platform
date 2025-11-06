// Book Management JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Check admin authentication
    if (!adminAuthCheck()) return;

    // Load initial books
    loadBooks();

    // Set up event listeners
    setupEventListeners();
});

let currentPage = 1;
const booksPerPage = 12;

// Set up event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(() => {
        currentPage = 1;
        loadBooks();
    }, 300));

    // Filters
    document.getElementById('categoryFilter').addEventListener('change', () => {
        currentPage = 1;
        loadBooks();
    });

    document.getElementById('sortBy').addEventListener('change', () => {
        currentPage = 1;
        loadBooks();
    });

    // Book upload form
    const uploadForm = document.getElementById('bookUploadForm');
    uploadForm.addEventListener('submit', handleBookUpload);
}

// Load books with filters and pagination
async function loadBooks() {
    try {
        const searchQuery = document.getElementById('searchInput').value;
        const category = document.getElementById('categoryFilter').value;
        const sortBy = document.getElementById('sortBy').value;

        const url = new URL('/api/books/search', window.location.origin);
        url.searchParams.append('page', currentPage);
        url.searchParams.append('limit', booksPerPage);
        if (searchQuery) url.searchParams.append('query', searchQuery);
        if (category) url.searchParams.append('category', category);
        if (sortBy) {
            const [field, order] = sortBy.split('-');
            url.searchParams.append('sortBy', field);
            url.searchParams.append('sortOrder', order || 'asc');
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch books');

        const data = await response.json();
        displayBooks(data.books);
        updatePagination(data.total, data.pages);
    } catch (error) {
        console.error('Error loading books:', error);
        showNotification('Error loading books', 'error');
    }
}

// Display books in grid
function displayBooks(books) {
    const bookList = document.getElementById('bookList');
    bookList.innerHTML = books.map(book => `
        <div class="book-card" data-id="${book._id}">
            <div class="book-cover">
                <img src="${book.coverImage}" alt="${book.title}">
                <div class="featured-toggle ${book.isFeatured ? 'active' : ''}" 
                     onclick="toggleFeatured('${book._id}', ${!book.isFeatured})">
                    <i class='bx bxs-star'></i>
                </div>
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <div class="book-metadata">
                    <span>
                        <i class='bx bx-download'></i>
                        ${book.metadata?.downloadCount || 0} downloads
                    </span>
                    <span>
                        <i class='bx bx-book-open'></i>
                        ${book.metadata?.pageCount || 0} pages
                    </span>
                    <span>
                        <i class='bx bx-file'></i>
                        ${book.fileType || 'PDF'}
                    </span>
                </div>
                <div class="book-actions">
                    <button class="btn-preview" onclick="previewBook('${book._id}')">
                        <i class='bx bx-book-reader'></i> Preview
                    </button>
                    <button class="btn-edit" onclick="editBook('${book._id}')">
                        <i class='bx bx-edit'></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteBook('${book._id}')">
                        <i class='bx bx-trash'></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Handle book upload
async function handleBookUpload(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);

    try {
        // Upload book
        const response = await fetch('/api/books/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (!response.ok) throw new Error('Failed to upload book');

        const data = await response.json();
        
        // Set featured status if checkbox is checked
        const featured = form.querySelector('#featured').checked;
        if (featured && data.bookId) {
            await fetch(`/api/books/${data.bookId}/featured`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isFeatured: true })
            });
        }

        showNotification('Book uploaded successfully', 'success');
        closeUploadModal();
        loadBooks();
    } catch (error) {
        console.error('Error uploading book:', error);
        showNotification('Error uploading book', 'error');
    }
}

// Toggle featured status
async function toggleFeatured(bookId, isFeatured) {
    try {
        const response = await fetch(`/api/books/${bookId}/featured`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isFeatured })
        });

        if (!response.ok) throw new Error('Failed to update featured status');

        await loadBooks(); // Reload to reflect changes
        showNotification(
            isFeatured ? 'Book added to featured' : 'Book removed from featured',
            'success'
        );
    } catch (error) {
        console.error('Error updating featured status:', error);
        showNotification('Error updating featured status', 'error');
    }
}

// Preview book in reader
function previewBook(bookId) {
    window.location.href = `../pages/reader-new.html?id=${bookId}`;
}

// Utility functions
function showNotification(message, type = 'info') {
    // Implement notification system
}

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

// Modal functions
function openUploadModal() {
    const modal = document.getElementById('uploadModal');
    modal.classList.add('active');
}

function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    modal.classList.remove('active');
    document.getElementById('bookUploadForm').reset();
}

// Pagination
function updatePagination(total, pages) {
    const pagination = document.getElementById('pagination');
    
    let html = '';
    if (currentPage > 1) {
        html += `<button class="page-btn" onclick="changePage(${currentPage - 1})">Previous</button>`;
    }
    
    for (let i = 1; i <= pages; i++) {
        html += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">${i}</button>
        `;
    }
    
    if (currentPage < pages) {
        html += `<button class="page-btn" onclick="changePage(${currentPage + 1})">Next</button>`;
    }
    
    pagination.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    loadBooks();
}