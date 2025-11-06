// Reader page functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!isLoggedIn()) {
        window.location.href = '/pages/login.html';
        return;
    }

    // Get book ID from URL
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get('id');

    if (!bookId) {
        showError('No book specified');
        return;
    }

    // Load book
    loadBook(bookId);
});

async function loadBook(bookId) {
    try {
        // Show loading state
        document.getElementById('loading').style.display = 'flex';

        // Get book details
        const book = await getBookById(bookId);
        if (!book) throw new Error('Book not found');

        // Update page title and header
        document.title = book.title;
        document.getElementById('bookTitle').textContent = book.title;

        // Check if book is in library
        const library = await getLibrary();
        const inLibrary = library.some(b => b._id === bookId);
        updateLibraryButton(inLibrary);

        // Load PDF in viewer
        loadPDF(book.documentUrl);

    } catch (error) {
        console.error('Error loading book:', error);
        showError(error.message);
    }
}

function loadPDF(url) {
    const viewer = document.getElementById('pdfViewer');
    
    // Check if PDFjs viewer is needed
    if (!url.endsWith('.pdf')) {
        // For non-PDF files, use browser's built-in viewer
        viewer.src = url;
        return;
    }

    // For PDFs, use PDF.js viewer
    const pdfViewerUrl = 'https://mozilla.github.io/pdf.js/web/viewer.html';
    viewer.src = `${pdfViewerUrl}?file=${encodeURIComponent(url)}`;

    // Hide loading when document loads
    viewer.onload = () => {
        document.getElementById('loading').style.display = 'none';
    };
}

async function toggleLibrary() {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get('id');
    if (!bookId) return;

    try {
        const library = await getLibrary();
        const inLibrary = library.some(b => b._id === bookId);

        if (inLibrary) {
            await removeFromLibrary(bookId);
            updateLibraryButton(false);
            showNotification('Removed from library');
        } else {
            await addToLibrary(bookId);
            updateLibraryButton(true);
            showNotification('Added to library');
        }
    } catch (error) {
        console.error('Error updating library:', error);
        showNotification('Failed to update library', 'error');
    }
}

function updateLibraryButton(inLibrary) {
    const btn = document.getElementById('libraryBtn');
    if (!btn) return;

    if (inLibrary) {
        btn.innerHTML = '<i class="bx bx-check"></i><span>In Library</span>';
        btn.classList.add('in-library');
    } else {
        btn.innerHTML = '<i class="bx bx-book-add"></i><span>Add to Library</span>';
        btn.classList.remove('in-library');
    }
}

function showError(message) {
    const container = document.querySelector('.reader-content');
    if (!container) return;

    document.getElementById('loading').style.display = 'none';
    
    container.innerHTML = `
        <div class="error-state">
            <i class='bx bx-error-circle'></i>
            <h3>Error</h3>
            <p>${message}</p>
            <button onclick="window.location.href='../main.html'" class="btn btn-primary">
                Return Home
            </button>
        </div>
    `;
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

// Navigation
function goBack() {
    window.location.href = document.referrer || '../main.html';
}