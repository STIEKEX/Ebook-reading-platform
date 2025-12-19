const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
  {
    pageNumber: Number,
    imageUrl: String, // legacy URL to page image (filesystem)
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'books.files' }, // GridFS file id (MongoDB)
    contentType: String,
  },
  { _id: false }
);

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['fiction', 'sci-fi', 'romance', 'education', 'mystery', 'thriller', 'other'],
      default: 'other',
    },
    // Cover stored either as legacy URL or GridFS file id
    coverImage: { type: String }, // legacy URL to cover image (filesystem)
    coverFileId: { type: mongoose.Schema.Types.ObjectId, ref: 'books.files' }, // GridFS
    // Optional PDF stored in GridFS
    pdfFileId: { type: mongoose.Schema.Types.ObjectId, ref: 'books.files' },
    // Pages (images) — support legacy URL or GridFS file id per page
    pages: [pageSchema],
    totalPages: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
