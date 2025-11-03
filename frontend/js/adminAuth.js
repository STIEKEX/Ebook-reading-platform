// Debug function to log authentication state
const logAuthState = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    console.log('Auth State:', {
        user: user,
        token: token,
        isAdmin: user.isAdmin,
        pathname: window.location.pathname
    });
};

// Admin routes protection middleware
const adminAuthCheck = () => {
    logAuthState(); // Log current auth state

    // Check if user is logged in and is admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    if (!token || !user.isAdmin) {
        console.log('Admin check failed:', { token: !!token, isAdmin: user.isAdmin });
        // Compute prefix similar to login.js so Live Server or backend paths both work
        const frontendPrefix = window.location.pathname.startsWith('/frontend') ? '' : '/frontend';
        window.location.href = `${frontendPrefix}/pages/login.html`;
        return false;
    }
    
    // Add token to API requests
    fetch.defaults = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    
    console.log('Admin check passed');
    return true;
};

// Check admin auth on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded:', window.location.pathname);
    
    if (window.location.pathname.includes('/admin')) {
        if (!adminAuthCheck()) {
            console.log('Redirecting to login - not authenticated as admin');
            return;
        }
        console.log('Admin authentication successful');
    }
});