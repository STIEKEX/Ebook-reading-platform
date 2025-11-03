const Book = require('../models/Book');
const History = require('../models/History');
const Review = require('../models/Review');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/books');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG images are allowed'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

exports.upload = upload;

// GET ALL BOOKS
exports.getAllBooks = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    const books = await Book.find(query).select('-pages'); // Don't send all pages in list view
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE BOOK DETAILS
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('uploadedBy', 'username');
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPLOAD BOOK (ADMIN ONLY)
exports.uploadBook = async (req, res) => {
  try {
    const { title, author, description, category } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // First file is cover image, rest are pages
    const coverImage = files[0];
    const pageImages = files.slice(1);

    // Store cover image URL (relative path)
    const coverImageUrl = `/uploads/books/${coverImage.filename}`;

    // Store page image URLs
    const pages = pageImages.map((file, index) => ({
      pageNumber: index + 1,
      imageUrl: `/uploads/books/${file.filename}`,
    }));

    const book = new Book({
      title,
      author,
      description,
      category: category || 'other',
      coverImage: coverImageUrl,
      pages,
      totalPages: pageImages.length,
      uploadedBy: req.userId,
    });

    await book.save();
    res.status(201).json({
      message: 'Book uploaded successfully',
      book,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET BOOK PAGE (for reading)
exports.getBookPage = async (req, res) => {
  try {
    const { id, pageNumber } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const page = book.pages.find(p => p.pageNumber === parseInt(pageNumber));
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    res.json({ page });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SAVE READING PROGRESS
exports.saveProgress = async (req, res) => {
  try {
    const { bookId, pageNumber } = req.body;
    const userId = req.userId;

    let history = await History.findOne({ userId, bookId });
    if (!history) {
      history = new History({ userId, bookId, lastReadPage: pageNumber });
    } else {
      history.lastReadPage = pageNumber;
    }

    await history.save();
    res.json({ message: 'Progress saved', history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET READING PROGRESS
exports.getProgress = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.userId;

    const history = await History.findOne({ userId, bookId });
    if (!history) {
      return res.json({ lastReadPage: 1, bookmarks: [], isFavorite: false });
    }

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// TOGGLE FAVORITE
exports.toggleFavorite = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.userId;

    let history = await History.findOne({ userId, bookId });
    if (!history) {
      history = new History({ userId, bookId, isFavorite: true });
    } else {
      history.isFavorite = !history.isFavorite;
    }

    await history.save();
    res.json({ message: 'Favorite status updated', isFavorite: history.isFavorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD BOOKMARK
exports.addBookmark = async (req, res) => {
  try {
    const { bookId, pageNumber } = req.body;
    const userId = req.userId;

    let history = await History.findOne({ userId, bookId });
    if (!history) {
      history = new History({ userId, bookId, bookmarks: [pageNumber] });
    } else {
      if (!history.bookmarks.includes(pageNumber)) {
        history.bookmarks.push(pageNumber);
      }
    }

    await history.save();
    res.json({ message: 'Bookmark added', bookmarks: history.bookmarks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REMOVE BOOKMARK
exports.removeBookmark = async (req, res) => {
  try {
    const { bookId, pageNumber } = req.body;
    const userId = req.userId;

    const history = await History.findOne({ userId, bookId });
    if (history) {
      history.bookmarks = history.bookmarks.filter(p => p !== pageNumber);
      await history.save();
    }

    res.json({ message: 'Bookmark removed', bookmarks: history?.bookmarks || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET FAVORITES (MY LIBRARY)
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.userId;
    const favorites = await History.find({ userId, isFavorite: true }).populate('bookId');
    const books = favorites.map(f => f.bookId);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
