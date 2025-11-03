// ==========================================
// SEARCH FUNCTIONALITY - CUSTOM FOR YOUR HTML
// ==========================================
const searchInput = document.getElementById('searchInput');

console.log('🔍 Search.js loaded!');
console.log('Search input found:', searchInput ? 'YES' : 'NO');

if (searchInput) {
    searchInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        console.log('Searching for:', query);
        performSearch(query);
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = this.value.trim().toLowerCase();
            performSearch(query);
        }
    });
}

function performSearch(query) {
    // YOUR BOOKS USE class="book-card"
    const bookCards = document.querySelectorAll('.book-card');
    console.log('Found book cards:', bookCards.length);
    
    let visibleCount = 0;
    
    if (query === '') {
        // Show all books if search is empty
        bookCards.forEach(card => {
            card.style.display = 'block';
        });
        removeNoResultsMessage();
        return;
    }
    
    // Search through each book card
    bookCards.forEach(card => {
        // Get all text content from the card (title, author, description)
        const allText = card.textContent.toLowerCase();
        
        // Check if query is found anywhere in the text
        if (allText.includes(query)) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    console.log('Visible books:', visibleCount);
    
    // Show or hide "No results" message
    if (visibleCount === 0) {
        showNoResultsMessage(query);
    } else {
        removeNoResultsMessage();
    }
}

function showNoResultsMessage(query) {
    // Remove existing message if any
    removeNoResultsMessage();
    
    // Find the first category_items container
    const container = document.querySelector('.category_items');
    
    if (!container) {
        console.error('❌ Could not find .category_items container');
        return;
    }
    
    console.log('✅ Showing no results message');
    
    // Create the "No Results Found" message
    const noResultsDiv = document.createElement('div');
    noResultsDiv.id = 'noResultsMessage';
    noResultsDiv.style.cssText = `
        width: 100%;
        max-width: 1200px;
        padding: 60px 20px;
        text-align: center;
        background: white;
        border-radius: 12px;
        margin: 20px auto;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        grid-column: 1 / -1;
    `;
    
    noResultsDiv.innerHTML = `
        <div style="max-width: 500px; margin: 0 auto;">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#1976d2" stroke-width="2" style="margin-bottom: 20px; opacity: 0.7;">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
            </svg>
            <h2 style="font-size: 28px; color: #333; margin-bottom: 15px; font-weight: 600;">No Results Found</h2>
            <p style="font-size: 16px; color: #666; margin-bottom: 10px; line-height: 1.6;">
                We couldn't find any books matching <strong style="color: #1976d2; font-weight: 600;">"${query}"</strong>
            </p>
            <p style="font-size: 14px; color: #999; margin-top: 15px; font-style: italic;">
                Try searching with different keywords or browse our collection
            </p>
            <button onclick="clearSearch()" style="
                margin-top: 25px;
                padding: 12px 30px;
                background-color: #1976d2;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(25,118,210,0.3);
                transition: all 0.3s ease;
            " 
            onmouseover="this.style.backgroundColor='#1565c0'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(25,118,210,0.4)'" 
            onmouseout="this.style.backgroundColor='#1976d2'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(25,118,210,0.3)'">
                Clear Search
            </button>
        </div>
    `;
    
    // Add the message to the first category container
    container.appendChild(noResultsDiv);
}

function removeNoResultsMessage() {
    const message = document.getElementById('noResultsMessage');
    if (message) {
        message.remove();
        console.log('Removed no results message');
    }
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        performSearch('');
        searchInput.focus();
        console.log(' Search cleared');
    }
}

// Make clearSearch function available globally
window.clearSearch = clearSearch;

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    #noResultsMessage {
        animation: fadeIn 0.3s ease-in-out;
    }
`;
document.head.appendChild(style);

// console.log(' Search.js fully loaded and ready!');
