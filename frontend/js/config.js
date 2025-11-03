// Configuration for the application
const config = {
    // API base URL
    apiBaseUrl: 'http://localhost:5000',
    
    // Frontend base URL
    baseUrl: 'http://localhost:5000',
    
    // Routes
    routes: {
        admin: {
            dashboard: '/admin/dashboard.html',
            books: '/admin/books.html',
            users: '/admin/users.html',
            reviews: '/admin/reviews.html'
        },
        auth: {
            login: '/pages/login.html',
            signup: '/pages/signup.html'
        },
        main: '/main.html'
    }
};

// Helper function to get full URL
const getUrl = (path) => `${config.baseUrl}${path}`;

// Helper function to get API URL
const getApiUrl = (path) => `${config.apiBaseUrl}${path}`;

// Export configuration
window.appConfig = config;
window.getUrl = getUrl;
window.getApiUrl = getApiUrl;