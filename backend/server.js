require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow ALL origins (development only)
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define frontend path
const FRONTEND_PATH = path.resolve(__dirname, '../frontend');

// Enable serving of static files
app.use(express.static(FRONTEND_PATH));

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Admin route handler
app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin/dashboard.html'));
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));

// Handle admin routes first
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, 'admin/dashboard.html'));
});

// Serve pages from the pages directory
app.get('/pages/*', (req, res) => {
  const pagePath = path.join(FRONTEND_PATH, req.path);
  res.sendFile(pagePath);
});

// Catch-all route for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next(); // Let API routes handle themselves
  }
  
  // Check if the file exists
  const filePath = path.join(FRONTEND_PATH, req.path);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  
  // Default to main.html
  res.sendFile(path.join(FRONTEND_PATH, 'main.html'));
});

// Health check

// Serve admin panel
app.get('/admin/*', (req, res, next) => {
  // Check if user is admin
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.redirect('/pages/login.html');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.redirect('/main.html');
    }
    next();
  } catch (error) {
    return res.redirect('/pages/login.html');
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: '✅ Backend is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
