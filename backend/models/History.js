const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    lastReadPage: { type: Number, default: 1 },
    bookmarks: [Number], // Array of bookmarked page numbers
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('History', historySchema);
