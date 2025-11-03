const express = require('express');
const bookController = require('../controllers/bookController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);
router.get('/:id/page/:pageNumber', bookController.getBookPage);

// Protected routes
router.post('/upload', authMiddleware, adminMiddleware, bookController.upload.array('files', 100), bookController.uploadBook);
router.post('/progress', authMiddleware, bookController.saveProgress);
router.get('/progress/:bookId', authMiddleware, bookController.getProgress);
router.post('/:id/favorite', authMiddleware, bookController.toggleFavorite);
router.post('/bookmark/add', authMiddleware, bookController.addBookmark);
router.post('/bookmark/remove', authMiddleware, bookController.removeBookmark);
router.get('/user/favorites', authMiddleware, bookController.getFavorites);

module.exports = router;
