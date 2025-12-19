const Book = require('../models/Book');
const History = require('../models/History');
const Review = require('../models/Review');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { GridFsStorage } = require('multer-gridfs-storage');

// Multer GridFS storage for MongoDB — stores files in GridFS bucket "books"
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    const filename = `${Date.now()}-${file.originalname}`;
    return {
      filename,
      bucketName: 'books',
      metadata: { mimeType: file.mimetype, fieldname: file.fieldname }
    };
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  return cb(new Error('Only JPEG, PNG images or PDF files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

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

    console.log('Upload request:', { title, author, category, filesCount: files?.length });

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    // Determine file roles
    // - If a PDF is included, store its fileId in pdfFileId
    // - For images: first image is cover, remaining are page images
    let coverFile = null;
    let pageImageFiles = [];
    let pdfFile = null;

    // Separate by mimetype
    files.forEach((f, idx) => {
      if (f.mimetype === 'application/pdf') {
        pdfFile = f; // support single pdf per upload in this version
      } else if (!coverFile) {
        coverFile = f; // first image is cover
      } else {
        pageImageFiles.push(f);
      }
    });

    if (!coverFile) {
      return res.status(400).json({ message: 'Cover image is required' });
    }

    const pages = pageImageFiles.map((file, index) => ({
      pageNumber: index + 1,
      fileId: file.id,
      imageUrl: `/api/books/file/${file.id}`,
      contentType: file.mimetype,
    }));

    const book = new Book({
      title,
      author,
      description,
      category: category || 'other',
      coverFileId: coverFile ? coverFile.id : undefined,
      coverImage: coverFile ? `/api/books/file/${coverFile.id}` : undefined, // keep backward-compatible field
      pages,
      totalPages: pages.length,
      pdfFileId: pdfFile ? pdfFile.id : undefined,
      uploadedBy: req.userId,
    });

    await book.save();
    console.log('Book saved:', book._id);
    res.status(201).json({
      message: 'Book uploaded successfully',
      book,
    });
  } catch (error) {
    console.error('Upload error:', error);
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

// STREAM FILE BY ID FROM GRIDFS (covers, pages, pdf)
exports.streamFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!fileId) return res.status(400).json({ message: 'fileId is required' });

    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'books' });
    const _id = new mongoose.Types.ObjectId(fileId);

    // Fetch file info to set headers
    const cursor = bucket.find({ _id });
    const files = await cursor.toArray();
    if (!files || files.length === 0) return res.status(404).json({ message: 'File not found' });
    const file = files[0];
    const contentType = file.contentType || file.metadata?.mimeType || 'application/octet-stream';
    res.set('Content-Type', contentType);

    const downloadStream = bucket.openDownloadStream(_id);
    downloadStream.on('error', () => res.status(404).end());
    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SAVE READING PROGRESS (supports page-based or location-based)
exports.saveProgress = async (req, res) => {
  try {
    const { bookId, pageNumber, lastReadChapter, lastReadOffset, progressPercent } = req.body;
    const userId = req.userId;

    let history = await History.findOne({ userId, bookId });
    if (!history) {
      history = new History({
        userId,
        bookId,
        lastReadPage: pageNumber || 1,
        lastReadChapter: lastReadChapter || null,
        lastReadOffset: typeof lastReadOffset === 'number' ? lastReadOffset : 0,
        progressPercent: typeof progressPercent === 'number' ? progressPercent : 0,
      });
    } else {
      if (typeof pageNumber === 'number') history.lastReadPage = pageNumber;
      if (typeof lastReadChapter === 'string') history.lastReadChapter = lastReadChapter;
      if (typeof lastReadOffset === 'number') history.lastReadOffset = lastReadOffset;
      if (typeof progressPercent === 'number') history.progressPercent = Math.max(0, Math.min(100, progressPercent));
    }

    await history.save();
    res.json({ message: 'Progress saved', history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET READING PROGRESS (page-based and/or location-based)
exports.getProgress = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.userId;

    const history = await History.findOne({ userId, bookId });
    if (!history) {
      return res.json({ lastReadPage: 1, lastReadChapter: null, lastReadOffset: 0, progressPercent: 0, bookmarks: [], bookmarkLocations: [], isFavorite: false });
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

// ADD BOOKMARK LOCATION (for normal reader)
exports.addBookmarkLocation = async (req, res) => {
  try {
    const { bookId, chapter, offset, note } = req.body;
    const userId = req.userId;

    let history = await History.findOne({ userId, bookId });
    if (!history) {
      history = new History({ userId, bookId, bookmarkLocations: [{ chapter, offset, note }] });
    } else {
      history.bookmarkLocations.push({ chapter, offset, note });
    }

    await history.save();
    res.json({ message: 'Bookmark saved', bookmarkLocations: history.bookmarkLocations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REMOVE BOOKMARK LOCATION
exports.removeBookmarkLocation = async (req, res) => {
  try {
    const { bookId, chapter, offset } = req.body;
    const userId = req.userId;

    const history = await History.findOne({ userId, bookId });
    if (history) {
      history.bookmarkLocations = history.bookmarkLocations.filter(
        (b) => !(b.chapter === chapter && b.offset === offset)
      );
      await history.save();
    }

    res.json({ message: 'Bookmark removed', bookmarkLocations: history?.bookmarkLocations || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET TEXT CONTENT FOR NORMAL READER
exports.getBookText = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // If PDF exists, extract text from GridFS using pdf-parse
    if (book.pdfFileId) {
      const pdfParse = require('pdf-parse');
      const mongoose = require('mongoose');
      const db = mongoose.connection.db;
      const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'books' });
      const _id = new mongoose.Types.ObjectId(book.pdfFileId);

      // Read file into a buffer
      const toBuffer = (stream) => new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (d) => chunks.push(d));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });

      const buf = await toBuffer(bucket.openDownloadStream(_id));
      const result = await pdfParse(buf);
      const raw = String(result.text || '').trim();

      if (!raw) {
        return res.json({ book: { id: book._id, title: book.title, author: book.author, coverImage: book.coverImage || (book.coverFileId ? `/api/books/file/${book.coverFileId}` : '') }, chapters: [] });
      }

      // Split into paragraphs (double newlines), then group into ~1500-2500 char chapters
      const paragraphs = raw.split(/\n\s*\n+/).map(p => p.replace(/\n+/g, ' ').trim()).filter(Boolean);
      const chapters = [];
      let current = [];
      let acc = 0;
      const minSize = 1500, maxSize = 2500;
      paragraphs.forEach((p) => {
        const len = p.length;
        if (acc + len > maxSize && acc >= minSize) {
          chapters.push(current.join('\n\n'));
          current = [p];
          acc = len;
        } else {
          current.push(p); acc += len;
        }
      });
      if (current.length) chapters.push(current.join('\n\n'));
      if (!chapters.length) chapters.push(raw);

      const htmlChapters = chapters.map((text, i) => ({
        id: `ch${i+1}`,
        title: i === 0 ? `${book.title} — Introduction` : `Chapter ${i+1}`,
        html: '<p>' + text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n\n/g,'</p><p>').replace(/\n/g,' ') + '</p>'
      }));

      return res.json({
        book: { id: book._id, title: book.title, author: book.author, coverImage: book.coverImage || (book.coverFileId ? `/api/books/file/${book.coverFileId}` : '') },
        chapters: htmlChapters
      });
    }

    // Fallback: no PDF — return stub (or later parse image text via OCR)
    const chapters = [
      {
        id: 'ch1',
        title: `${book.title} — Introduction`,
        html: `<p>${book.description || 'No description provided.'}</p>`
      }
    ];

    res.json({ book: { id: book._id, title: book.title, author: book.author, coverImage: book.coverImage || (book.coverFileId ? `/api/books/file/${book.coverFileId}` : '') }, chapters });
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
