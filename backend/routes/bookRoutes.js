const express = require('express');
const bookController = require('../controllers/bookController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);
router.get('/:id/page/:pageNumber', bookController.getBookPage);
router.get('/:id/text', bookController.getBookText);
// Stream file stored in GridFS
router.get('/file/:fileId', bookController.streamFile);

// Protected routes
router.post('/upload', authMiddleware, adminMiddleware, bookController.upload.any(), bookController.uploadBook);
router.post('/progress', authMiddleware, bookController.saveProgress);
router.get('/progress/:bookId', authMiddleware, bookController.getProgress);
router.post('/:id/favorite', authMiddleware, bookController.toggleFavorite);
router.post('/bookmark/add', authMiddleware, bookController.addBookmark);
router.post('/bookmark/remove', authMiddleware, bookController.removeBookmark);
router.post('/bookmark/add-location', authMiddleware, bookController.addBookmarkLocation);
router.post('/bookmark/remove-location', authMiddleware, bookController.removeBookmarkLocation);
router.get('/user/favorites', authMiddleware, bookController.getFavorites);

module.exports = router;
