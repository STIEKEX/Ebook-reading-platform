const FavoriteLine = require('../models/FavoriteLine');

exports.addFavoriteLine = async (req, res) => {
  try {
    const userId = req.userId;
    const { bookId, text, chapter, location, color, note } = req.body;

    if (!text || !bookId) return res.status(400).json({ message: 'text and bookId are required' });

    const fav = await FavoriteLine.create({ userId, bookId, text, chapter, location, color, note });
    res.status(201).json({ message: 'Added to Favourite Lines', favorite: fav });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFavoriteLines = async (req, res) => {
  try {
    const userId = req.userId;
    const { bookId } = req.query;
    const filter = { userId };
    if (bookId) filter.bookId = bookId;

    const list = await FavoriteLine.find(filter).sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFavoriteLine = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const deleted = await FavoriteLine.findOneAndDelete({ _id: id, userId });
    if (!deleted) return res.status(404).json({ message: 'Not found' });

    res.json({ message: 'Removed from Favourite Lines' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
