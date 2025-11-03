document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is logged in
  if (!isLoggedIn()) {
    // Redirect to login if not logged in
    window.location.href = './pages/login.html';
    return;
  }

  // Get current user
  const user = getCurrentUser();
  console.log('Logged in as:', user);

  // Update navbar auth area: replace Sign In / Sign Up with user's name and buttons inside header when logged in
  try {
    const loginArea = document.querySelector('.login');
    if (loginArea) {
      if (user) {
        const displayName = user.username || user.name || user.screenName || (user.email && user.email.split('@')[0]) || 'User';
        const initial = (displayName && displayName[0]) ? displayName[0].toUpperCase() : 'U';
        // Avatar button + dropdown inside header
        loginArea.innerHTML = `
          <div class="nav-user-inline">
            <button class="nav-user-avatar" id="navUserAvatar" aria-expanded="false" title="${displayName}">${initial}</button>
            <div class="nav-user-dropdown" id="navUserDropdown" role="menu" aria-hidden="true">
              <a href='./pages/profile.html' id='navProfile'><i class="fa fa-user"></i> My Profile</a>
              <a href='./pages/my-library.html' id='navMyLibrary'><i class="fa fa-book"></i> My Library</a>
              <a href='#' id='navLogout'><i class="fa fa-sign-out-alt"></i> Logout</a>
            </div>
          </div>
        `;

        // Wire avatar and dropdown
        const avatarBtn = document.getElementById('navUserAvatar');
        const dropdown = document.getElementById('navUserDropdown');

        function closeDropdown() {
          if (dropdown) {
            dropdown.style.display = 'none';
            avatarBtn.setAttribute('aria-expanded', 'false');
            dropdown.setAttribute('aria-hidden', 'true');
          }
        }

        function openDropdown() {
          if (dropdown) {
            dropdown.style.display = 'block';
            avatarBtn.setAttribute('aria-expanded', 'true');
            dropdown.setAttribute('aria-hidden', 'false');
          }
        }

        avatarBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = avatarBtn.getAttribute('aria-expanded') === 'true';
          if (isOpen) closeDropdown(); else openDropdown();
        });

        // close on outside click
        document.addEventListener('click', (e) => {
          const container = loginArea.querySelector('.nav-user-inline');
          if (!container.contains(e.target)) closeDropdown();
        });

        // Wire dropdown links
        const myLib = document.getElementById('navMyLibrary');
        const prof = document.getElementById('navProfile');
        const logoutNav = document.getElementById('navLogout');
        if (myLib) myLib.addEventListener('click', () => { window.location.href = './pages/my-library.html'; });
        if (prof) prof.addEventListener('click', () => { window.location.href = './pages/profile.html'; });
        if (logoutNav) logoutNav.addEventListener('click', (ev) => { ev.preventDefault(); logout(); });
      } else {
        // Not logged in: leave existing Sign In / Sign Up buttons as rendered in HTML
      }
    }
  } catch (err) {
    console.error('Error updating navbar auth area:', err);
  }

  // NOTE: Floating nav buttons removed — actions are now placed in the header when logged in

  // Load books from backend
  const books = await getAllBooks();
  console.log('Books loaded:', books);

  // Display books
  displayBooks(books);
});

function displayBooks(books) {
  // Find your books container (adjust selector based on your HTML)
  const booksContainer = document.getElementById('booksContainer') 
    || document.querySelector('.books-grid') 
    || document.querySelector('.books-container');

  if (!booksContainer) {
    console.error('Books container not found!');
    return;
  }

  if (books.length === 0) {
    booksContainer.innerHTML = '<p>No books available yet.</p>';
    return;
  }

  booksContainer.innerHTML = books.map(book => `
    <div class="book-card" onclick="openBook('${book._id}')" style="cursor: pointer;">
      <img src="${book.coverImage}" alt="${book.title}" class="book-cover" style="width: 100%; height: 200px; object-fit: cover;"/>
      <div class="book-info" style="padding: 10px;">
        <div class="book-title" style="font-weight: bold;">${book.title}</div>
        <div class="book-author" style="color: #aaa;">by ${book.author}</div>
        <div style="color: #FFD700; font-size: 12px;">⭐ ${book.averageRating.toFixed(1)} (${book.totalReviews} reviews)</div>
      </div>
    </div>
  `).join('');
}

function openBook(bookId) {
  window.location.href = `./pages/reader.html?id=${bookId}`;
}

// Add search functionality
async function searchBooks(query) {
  const books = await getAllBooks(query);
  displayBooks(books);
}

// Add filter by category
async function filterByCategory(category) {
  const books = await getAllBooks('', category);
  displayBooks(books);
}


// Logout function
function logout() {
  // Clear all stored data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Redirect to login page
  window.location.href = './pages/login.html';
}
