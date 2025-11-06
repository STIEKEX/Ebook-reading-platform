// Book management functionality
class BookManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalPages = 1;
        this.currentSort = 'newest';
        this.currentCategory = '';
        this.searchQuery = '';
        
        this.initializeEventListeners();
        this.loadBooks();
    }

    initializeEventListeners() {
        // Search input
        document.getElementById('searchInput').addEventListener('input', debounce((e) => {
            this.searchQuery = e.target.value;
            this.currentPage = 1;
            this.loadBooks();
        }, 500));

        // Filters
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.currentPage = 1;
            this.loadBooks();
        });

        document.getElementById('sortFilter').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.loadBooks();
        });

        // Book form
        document.getElementById('bookForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBookSubmit(e);
        });

        // Add book button
        document.getElementById('addBookBtn').addEventListener('click', () => {
            this.openModal();
        });
    }

    async loadBooks() {
        try {
            const response = await fetch(`/api/admin/books?page=${this.currentPage}&limit=${this.itemsPerPage}&sort=${this.currentSort}&category=${this.currentCategory}&search=${this.searchQuery}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load books');
            }

            this.renderBooks(data.results);
            this.renderPagination(data.pagination);
        } catch (error) {
            console.error('Error loading books:', error);
            showError('Failed to load books');
        }
    }

    renderBooks(books) {
        const tbody = document.getElementById('booksTableBody');
        tbody.innerHTML = '';

        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${book.coverImage}" alt="${book.title}" class="book-cover-thumb">
                </td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.category}</td>
                <td>
                    <div class="rating">
                        ${book.averageRating.toFixed(1)} ⭐
                        <span class="review-count">(${book.totalReviews})</span>
                    </div>
                </td>
                <td>${new Date(book.createdAt).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button onclick="bookManager.editBook('${book._id}')" class="edit-btn">
                            <i class='bx bx-edit'></i>
                        </button>
                        <button onclick="bookManager.deleteBook('${book._id}')" class="delete-btn">
                            <i class='bx bx-trash'></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderPagination(pagination) {
        const container = document.getElementById('pagination');
        this.totalPages = pagination.pages;

        let html = '';
        if (pagination.pages > 1) {
            html += `
                <button ${this.currentPage === 1 ? 'disabled' : ''} 
                        onclick="bookManager.changePage(${this.currentPage - 1})">
                    Previous
                </button>
            `;

            for (let i = 1; i <= pagination.pages; i++) {
                if (i === 1 || i === pagination.pages || 
                    (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                    html += `
                        <button class="${i === this.currentPage ? 'active' : ''}"
                                onclick="bookManager.changePage(${i})">
                            ${i}
                        </button>
                    `;
                } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                    html += '<span class="pagination-dots">...</span>';
                }
            }

            html += `
                <button ${this.currentPage === pagination.pages ? 'disabled' : ''} 
                        onclick="bookManager.changePage(${this.currentPage + 1})">
                    Next
                </button>
            `;
        }

        container.innerHTML = html;
    }

    async handleBookSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        try {
            const response = await fetch('/api/admin/books', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to save book');
            }

            showSuccess('Book saved successfully');
            this.closeModal();
            this.loadBooks();
        } catch (error) {
            console.error('Error saving book:', error);
            showError(error.message);
        }
    }

    async editBook(bookId) {
        try {
            const response = await fetch(`/api/admin/books/${bookId}`);
            const book = await response.json();

            if (!response.ok) {
                throw new Error(book.error || 'Failed to load book details');
            }

            this.openModal(book);
        } catch (error) {
            console.error('Error loading book:', error);
            showError(error.message);
        }
    }

    async deleteBook(bookId) {
        if (!confirm('Are you sure you want to delete this book?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/books/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete book');
            }

            showSuccess('Book deleted successfully');
            this.loadBooks();
        } catch (error) {
            console.error('Error deleting book:', error);
            showError(error.message);
        }
    }

    openModal(book = null) {
        const modal = document.getElementById('bookModal');
        const form = document.getElementById('bookForm');
        const modalTitle = document.getElementById('modalTitle');

        modalTitle.textContent = book ? 'Edit Book' : 'Add New Book';
        
        if (book) {
            ['title', 'author', 'description', 'category', 'language'].forEach(field => {
                form[field].value = book[field] || '';
            });
            form.tags.value = book.tags?.join(', ') || '';
            form.dataset.bookId = book._id;
        } else {
            form.reset();
            delete form.dataset.bookId;
        }

        modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('bookModal');
        modal.style.display = 'none';
    }

    changePage(page) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.loadBooks();
    }
}

// Utility functions
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

function showSuccess(message) {
    // Implement success toast notification
    console.log('Success:', message);
}

function showError(message) {
    // Implement error toast notification
    console.error('Error:', message);
}

// Initialize book manager
const bookManager = new BookManager();

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('bookModal');
    if (event.target === modal) {
        bookManager.closeModal();
    }
};