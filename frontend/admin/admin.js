// Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Mobile sidebar toggle
    const toggleSidebar = () => {
        const sidebar = document.querySelector('.admin-sidebar');
        sidebar.classList.toggle('show');
    };

    // Fetch and update stats
    const updateStats = async () => {
        try {
            const response = await fetch('/api/admin/stats');
            const stats = await response.json();
            
            // Update stats cards
            updateStatCard('books', stats.totalBooks);
            updateStatCard('users', stats.activeUsers);
            updateStatCard('reviews', stats.totalReviews);
            updateStatCard('reads', stats.totalReads);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const updateStatCard = (type, value) => {
        const statElement = document.querySelector(`.stat-card .stat-icon.${type}`).nextElementSibling.querySelector('h3');
        if (statElement) {
            statElement.textContent = formatNumber(value);
        }
    };

    // Format numbers (e.g., 1234 to 1.2K)
    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    // Fetch and update recent activities
    const updateActivities = async () => {
        try {
            const [books, users, reviews] = await Promise.all([
                fetch('/api/admin/recent-books').then(res => res.json()),
                fetch('/api/admin/recent-users').then(res => res.json()),
                fetch('/api/admin/recent-reviews').then(res => res.json())
            ]);

            updateActivityList('books', books);
            updateActivityList('users', users);
            updateActivityList('reviews', reviews);
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    };

    const updateActivityList = (type, items) => {
        const container = document.querySelector(`.activity-card:has(h3:contains("${type}")) .activity-list`);
        if (!container) return;

        container.innerHTML = items.map(item => createActivityItem(type, item)).join('');
    };

    const createActivityItem = (type, item) => {
        switch (type) {
            case 'books':
                return `
                    <div class="activity-item">
                        <img src="${item.coverUrl}" alt="${item.title}">
                        <div class="item-content">
                            <div class="item-title">${item.title}</div>
                            <div class="item-subtitle">Added ${formatTimeAgo(item.addedAt)}</div>
                        </div>
                    </div>
                `;
            case 'users':
                return `
                    <div class="activity-item">
                        <div class="admin-avatar">${item.name.charAt(0)}</div>
                        <div class="item-content">
                            <div class="item-title">${item.name}</div>
                            <div class="item-subtitle">Joined ${formatTimeAgo(item.joinedAt)}</div>
                        </div>
                    </div>
                `;
            case 'reviews':
                return `
                    <div class="activity-item">
                        <div class="admin-avatar">${item.userName.charAt(0)}</div>
                        <div class="item-content">
                            <div class="item-title">Review on "${item.bookTitle}"</div>
                            <div class="item-subtitle">Posted ${formatTimeAgo(item.postedAt)}</div>
                        </div>
                    </div>
                `;
        }
    };

    // Format time ago (e.g., "2 hours ago")
    const formatTimeAgo = (timestamp) => {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval > 1) return interval + ' years ago';
        if (interval === 1) return '1 year ago';
        
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) return interval + ' months ago';
        if (interval === 1) return '1 month ago';
        
        interval = Math.floor(seconds / 86400);
        if (interval > 1) return interval + ' days ago';
        if (interval === 1) return '1 day ago';
        
        interval = Math.floor(seconds / 3600);
        if (interval > 1) return interval + ' hours ago';
        if (interval === 1) return '1 hour ago';
        
        interval = Math.floor(seconds / 60);
        if (interval > 1) return interval + ' minutes ago';
        if (interval === 1) return '1 minute ago';
        
        return 'just now';
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    // Setup event listeners
    document.querySelector('.sidebar-footer .btn').addEventListener('click', handleLogout);

    // Initialize
    updateStats();
    updateActivities();

    // Update activities every 5 minutes
    setInterval(updateActivities, 300000);
});