const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Book = require('../models/Book');
const BookMetadata = require('../models/BookMetadata');
const authMiddleware = require('../middleware/authMiddleware');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, process.env.UPLOAD_PATH || './uploads/books');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.epub', '.mobi'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, EPUB, and MOBI files are allowed.'));
        }
    }
});

// Upload a new book with metadata
router.post('/upload', authMiddleware, upload.single('bookFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const bookData = {
            title: req.body.title,
            author: req.body.author,
            description: req.body.description,
            category: req.body.category,
            filePath: req.file.path,
            coverImage: req.body.coverImage
        };

        const book = new Book(bookData);
        await book.save();

        const metadataData = {
            bookId: book._id,
            isbn: req.body.isbn,
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
            language: req.body.language,
            publicationDate: req.body.publicationDate,
            publisher: req.body.publisher,
            pageCount: req.body.pageCount,
            fileSize: req.file.size,
            searchIndex: `${req.body.title} ${req.body.author} ${req.body.description} ${req.body.tags}`
        };

        const metadata = new BookMetadata(metadataData);
        await metadata.save();

        res.status(201).json({ 
            message: 'Book uploaded successfully',
            book: { ...book.toObject(), metadata: metadata.toObject() }
        });
    } catch (error) {
        console.error('Error uploading book:', error);
        res.status(500).json({ message: 'Error uploading book', error: error.message });
    }
});

// Search books with filters and sorting
router.get('/search', async (req, res) => {
    try {
        const {
            query,
            category,
            language,
            sortBy,
            sortOrder,
            page = 1,
            limit = 10
        } = req.query;

        const filter = {};
        if (category) filter.category = category;
        
        // Text search in book and metadata
        const searchQuery = query ? {
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        } : {};

        // Build sort object
        const sort = {};
        if (sortBy) {
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        }

        const books = await Book.aggregate([
            { $match: { ...filter, ...searchQuery } },
            {
                $lookup: {
                    from: 'bookmetadata',
                    localField: '_id',
                    foreignField: 'bookId',
                    as: 'metadata'
                }
            },
            { $unwind: '$metadata' },
            { $sort: sort },
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) }
        ]);

        const total = await Book.countDocuments({ ...filter, ...searchQuery });

        res.json({
            books,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error searching books:', error);
        res.status(500).json({ message: 'Error searching books', error: error.message });
    }
});

module.exports = router;