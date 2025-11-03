const API_BASE = 'http://localhost:5000/api';

// Get JWT token from localStorage
const getToken = () => localStorage.getItem('token');
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

// ========== AUTH ==========
async function signup(username, email, password, adminCode = '') {
  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, adminCode }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true, message: data.message, user: data.user };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function login(email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true, message: data.message, user: data.user };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/pages/login.html';
}

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// ========== BOOKS ==========
async function getAllBooks(search = '', category = 'all') {
  try {
    const res = await fetch(`${API_BASE}/books?search=${search}&category=${category}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

async function getBookById(id) {
  try {
    const res = await fetch(`${API_BASE}/books/${id}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching book:', error);
    return null;
  }
}

async function getBookPage(bookId, pageNumber) {
  try {
    const res = await fetch(`${API_BASE}/books/${bookId}/page/${pageNumber}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

async function uploadBook(formData) {
  try {
    const res = await fetch(`${API_BASE}/books/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData,
    });
    return await res.json();
  } catch (error) {
    return { message: error.message };
  }
}

// ========== PROGRESS & BOOKMARKS ==========
async function saveProgress(bookId, pageNumber) {
  try {
    const res = await fetch(`${API_BASE}/books/progress`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bookId, pageNumber }),
    });
    return await res.json();
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

async function getProgress(bookId) {
  try {
    const res = await fetch(`${API_BASE}/books/progress/${bookId}`, {
      headers: getHeaders(),
    });
    return await res.json();
  } catch (error) {
    console.error('Error getting progress:', error);
    return { lastReadPage: 1, bookmarks: [], isFavorite: false };
  }
}

async function toggleFavorite(bookId) {
  try {
    const res = await fetch(`${API_BASE}/books/${bookId}/favorite`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return await res.json();
  } catch (error) {
    console.error('Error toggling favorite:', error);
  }
}

async function addBookmark(bookId, pageNumber) {
  try {
    const res = await fetch(`${API_BASE}/books/bookmark/add`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bookId, pageNumber }),
    });
    return await res.json();
  } catch (error) {
    console.error('Error adding bookmark:', error);
  }
}

async function removeBookmark(bookId, pageNumber) {
  try {
    const res = await fetch(`${API_BASE}/books/bookmark/remove`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bookId, pageNumber }),
    });
    return await res.json();
  } catch (error) {
    console.error('Error removing bookmark:', error);
  }
}

async function getFavorites() {
  try {
    const res = await fetch(`${API_BASE}/books/user/favorites`, {
      headers: getHeaders(),
    });
    return await res.json();
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
}

// ========== REVIEWS ==========
async function addReview(bookId, rating, text) {
  try {
    const res = await fetch(`${API_BASE}/reviews/add`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bookId, rating, text }),
    });
    return await res.json();
  } catch (error) {
    console.error('Error adding review:', error);
  }
}

async function getReviews(bookId) {
  try {
    const res = await fetch(`${API_BASE}/reviews/${bookId}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

async function getUserReview(bookId) {
  try {
    const res = await fetch(`${API_BASE}/reviews/${bookId}/user`, {
      headers: getHeaders(),
    });
    return await res.json();
  } catch (error) {
    console.error('Error fetching user review:', error);
    return null;
  }
}

// ========== USER PROFILE ==========
async function getProfile() {
  try {
    const res = await fetch(`${API_BASE}/user/profile`, {
      headers: getHeaders(),
    });
    return await res.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
}

async function updateProfile(name, avatar) {
  try {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name, avatar }),
    });
    return await res.json();
  } catch (error) {
    console.error('Error updating profile:', error);
  }
}

async function changePassword(oldPassword, newPassword) {
  try {
    const res = await fetch(`${API_BASE}/user/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    return await res.json();
  } catch (error) {
    console.error('Error changing password:', error);
  }
}
