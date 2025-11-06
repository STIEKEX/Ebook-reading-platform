const mongoose = require('mongoose');

const bookMetadataSchema = new mongoose.Schema({
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    isbn: {
        type: String,
        unique: true
    },
    tags: [String],
    language: String,
    publicationDate: Date,
    publisher: String,
    pageCount: Number,
    fileSize: Number,
    downloadCount: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    searchIndex: {
        type: String,
        index: true
    }
}, {
    timestamps: true
});

// Create text index for efficient search
bookMetadataSchema.index({ searchIndex: 'text', tags: 'text' });

module.exports = mongoose.model('BookMetadata', bookMetadataSchema);