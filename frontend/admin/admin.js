// Admin Panel JavaScript

let booksChart = null;
let categoryChart = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Admin Dashboard Loading...');
    
    // Load dashboard data
    await loadDashboardData();
    
    // Initialize charts
    initializeCharts();
    
    // Update activities every 30 seconds
    setInterval(loadRecentActivity, 30000);
});

// Load all dashboard data
async function loadDashboardData() {
    try {
        await Promise.all([
            loadStats(),
            loadRecentActivity(),
            loadChartData()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load statistics
async function loadStats() {
    try {
        console.log('📊 Loading stats from:', `${API_BASE}/books`);
        
        // Fetch books
        const booksResponse = await fetch(`${API_BASE}/books`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const books = await booksResponse.json();
        console.log('📚 Total books:', books.length);
        document.getElementById('totalBooks').textContent = books.length || 0;
        document.getElementById('totalUploads').textContent = books.length || 0;

        // Fetch users (admin only)
        try {
            const usersResponse = await fetch(`${API_BASE}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (usersResponse.ok) {
                const users = await usersResponse.json();
                document.getElementById('totalUsers').textContent = users.length || 0;
            }
        } catch (err) {
            console.log('Users endpoint not available:', err);
            document.getElementById('totalUsers').textContent = '0';
        }

        // Fetch reviews
        try {
            const reviewsResponse = await fetch(`${API_BASE}/reviews`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (reviewsResponse.ok) {
                const reviews = await reviewsResponse.json();
                document.getElementById('totalReviews').textContent = reviews.length || 0;
            }
        } catch (err) {
            console.log('Reviews endpoint not available:', err);
            document.getElementById('totalReviews').textContent = '0';
        }

    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load recent activity
async function loadRecentActivity() {
    try {
        const response = await fetch(`${API_BASE}/books?limit=10`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const books = await response.json();

        const activityContainer = document.getElementById('recentActivity');
        
        if (!books || books.length === 0) {
            activityContainer.innerHTML = '<div class="placeholder-text">No recent activity</div>';
            return;
        }

        // Sort by createdAt (newest first)
        const sortedBooks = books.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        activityContainer.innerHTML = sortedBooks.slice(0, 10).map(book => `
            <div class="activity-item">
                <i class='bx bx-book-add'></i>
                <div class="activity-content">
                    <div class="activity-title">New book: "${book.title}" uploaded</div>
                    <div class="activity-time">${formatTimeAgo(book.createdAt)}</div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading recent activity:', error);
        document.getElementById('recentActivity').innerHTML = 
            '<div class="placeholder-text">Error loading activity</div>';
    }
}

// Format time ago
function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Recently';
    
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + ' year' + (interval > 1 ? 's' : '') + ' ago';
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + ' month' + (interval > 1 ? 's' : '') + ' ago';
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + ' day' + (interval > 1 ? 's' : '') + ' ago';
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + ' hour' + (interval > 1 ? 's' : '') + ' ago';
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + ' minute' + (interval > 1 ? 's' : '') + ' ago';
    
    return 'just now';
}

// Load chart data
async function loadChartData() {
    try {
        const response = await fetch(`${API_BASE}/books`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const books = await response.json();

        // Process data for books by month chart
        const monthlyData = processMonthlyData(books);
        updateBooksChart(monthlyData);

        // Process data for category chart
        const categoryData = processCategoryData(books);
        updateCategoryChart(categoryData);

    } catch (error) {
        console.error('Error loading chart data:', error);
    }
}

// Process monthly upload data
function processMonthlyData(books) {
    const months = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        months[monthKey] = 0;
    }

    // Count books per month
    books.forEach(book => {
        if (book.createdAt) {
            const date = new Date(book.createdAt);
            const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            if (months.hasOwnProperty(monthKey)) {
                months[monthKey]++;
            }
        }
    });

    return {
        labels: Object.keys(months),
        data: Object.values(months)
    };
}

// Process category data
function processCategoryData(books) {
    const categories = {};

    books.forEach(book => {
        const category = book.category || 'Other';
        categories[category] = (categories[category] || 0) + 1;
    });

    return {
        labels: Object.keys(categories),
        data: Object.values(categories)
    };
}

// Initialize charts
function initializeCharts() {
    // Books by month chart
    const booksCtx = document.getElementById('booksChart');
    if (booksCtx) {
        booksChart = new Chart(booksCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Books Uploaded',
                    data: [],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    // Category chart
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        categoryChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)',
                        'rgb(139, 92, 246)',
                        'rgb(236, 72, 153)',
                        'rgb(20, 184, 166)',
                        'rgb(251, 146, 60)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Update books chart
function updateBooksChart(data) {
    if (booksChart) {
        booksChart.data.labels = data.labels;
        booksChart.data.datasets[0].data = data.data;
        booksChart.update();
    }
}

// Update category chart
function updateCategoryChart(data) {
    if (categoryChart) {
        categoryChart.data.labels = data.labels;
        categoryChart.data.datasets[0].data = data.data;
        categoryChart.update();
    }
}

// Logout function
async function logout() {
    try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Error logging out:', error);
    }
}