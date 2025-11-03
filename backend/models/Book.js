const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, default: '' },
    category: { 
      type: String, 
      enum: ['fiction', 'sci-fi', 'romance', 'education', 'mystery', 'thriller', 'other'],
      default: 'other'
    },
    coverImage: { type: String, required: true }, // URL to cover image
    pages: [
      {
        pageNumber: Number,
        imageUrl: String, // URL to page image
      }
    ],
    totalPages: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
