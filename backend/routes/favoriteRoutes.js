const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const favoriteController = require('../controllers/favoriteController');

const router = express.Router();

router.use(authMiddleware);

router.get('/lines', favoriteController.getFavoriteLines);
router.post('/lines', favoriteController.addFavoriteLine);
router.delete('/lines/:id', favoriteController.removeFavoriteLine);

module.exports = router;
