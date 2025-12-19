/**
 * Integration script for 3D Book Reader
 * Adds "Read" buttons to book cards and handles reader launch
 */

// Function to add Read buttons to all book cards
function add3DReaderButtons() {
    const bookCards = document.querySelectorAll('.book-card');
    
    bookCards.forEach(card => {
        // Check if Read button already exists
        if (card.querySelector('.btn-read-3d')) return;
        
        // Get book data from card
        const bookId = card.dataset.id || card.getAttribute('data-id');
        const title = card.querySelector('.book-title, h3')?.textContent || 'Unknown Title';
        const author = card.querySelector('.book-author, .author')?.textContent || 'Unknown Author';
        const coverUrl = card.dataset.cover || card.getAttribute('data-cover') || card.querySelector('.book-cover img, img')?.src || '';
        
        console.log('📖 Adding 3D reader button for book:', { bookId, title, author, coverUrl });
        
        // Skip if no book ID
        if (!bookId || bookId === 'null' || bookId === 'undefined') {
            console.warn('⚠️ Skipping card - no valid book ID');
            return;
        }
        
    // Create Read button (3D)
    const readBtn = document.createElement('button');
        readBtn.className = 'btn-read-3d';
        readBtn.innerHTML = '<i class="bx bx-book-open"></i> Read in 3D';
        readBtn.style.cssText = `
            background: linear-gradient(135deg, #ffc12c 0%, #f59e0b 100%);
            color: #fff;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 10px;
            width: 100%;
            justify-content: center;
            transition: all 0.3s ease;
            font-size: 14px;
        `;
        
        // Add hover effect
        readBtn.addEventListener('mouseenter', () => {
            readBtn.style.transform = 'translateY(-2px)';
            readBtn.style.boxShadow = '0 6px 20px rgba(255, 193, 44, 0.4)';
        });
        
        readBtn.addEventListener('mouseleave', () => {
            readBtn.style.transform = 'translateY(0)';
            readBtn.style.boxShadow = 'none';
        });
        
        // Add click handler
        readBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            open3DBookReader({
                id: bookId,
                title: title,
                author: author,
                coverUrl: coverUrl
            });
        });
        
        // Create Focus Mode button (Normal Reader)
        const focusBtn = document.createElement('button');
        focusBtn.className = 'btn-read-focus';
        focusBtn.innerHTML = '<i class="bx bx-book"></i> Read (Focus)';
        focusBtn.style.cssText = `
            background: linear-gradient(135deg, #4f7cff 0%, #22d3ee 100%);
            color: #fff;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 8px;
            width: 100%;
            justify-content: center;
            transition: all 0.3s ease;
            font-size: 14px;
        `;
        focusBtn.addEventListener('mouseenter', () => {
            focusBtn.style.transform = 'translateY(-2px)';
            focusBtn.style.boxShadow = '0 6px 20px rgba(79, 124, 255, 0.35)';
        });
        focusBtn.addEventListener('mouseleave', () => {
            focusBtn.style.transform = 'translateY(0)';
            focusBtn.style.boxShadow = 'none';
        });
        focusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openFocusReader({ id: bookId, title, author, coverUrl });
        });

        // Add button to card
        const cardActions = card.querySelector('.book-actions, .card-footer, .book-info');
        if (cardActions) {
            cardActions.appendChild(readBtn);
            cardActions.appendChild(focusBtn);
        } else {
            card.appendChild(readBtn);
            card.appendChild(focusBtn);
        }
    });
}

// Function to open the 3D book reader
function open3DBookReader(bookData) {
    // Open reader in new window or navigate to reader page
    const readerUrl = `./pages/book-reader.html?bookId=${bookData.id}`;
    
    // Option 1: Open in new tab
    // window.open(readerUrl, '_blank');
    
    // Option 2: Navigate to reader page (recommended for better UX)
    sessionStorage.setItem('currentBook', JSON.stringify(bookData));
    window.location.href = readerUrl;
}

// Function to open the Focus (Normal) reader
function openFocusReader(bookData) {
    const readerUrl = `./pages/reader-normal.html?bookId=${bookData.id}`;
    sessionStorage.setItem('currentBook', JSON.stringify(bookData));
    window.location.href = readerUrl;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for books to load dynamically
        setTimeout(add3DReaderButtons, 1000);
        
        // Also add observer for dynamically loaded content
        observeBookCardsChanges();
    });
} else {
    setTimeout(add3DReaderButtons, 1000);
    observeBookCardsChanges();
}

// Observer to detect when new book cards are added
function observeBookCardsChanges() {
    const booksContainer = document.getElementById('booksContainer') || 
                          document.querySelector('.books-grid') || 
                          document.querySelector('.book-grid');
    
    if (!booksContainer) return;
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                setTimeout(add3DReaderButtons, 100);
            }
        });
    });
    
    observer.observe(booksContainer, {
        childList: true,
        subtree: true
    });
}

// Export function for external use
window.open3DBookReader = open3DBookReader;
window.add3DReaderButtons = add3DReaderButtons;
window.openFocusReader = openFocusReader;
