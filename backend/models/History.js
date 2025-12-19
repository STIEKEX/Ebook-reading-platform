const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    lastReadPage: { type: Number, default: 1 },
    // Normal Reader additional progress fields
    lastReadChapter: { type: String, default: null },
    lastReadOffset: { type: Number, default: 0 }, // scrollTop in pixels or character offset
    progressPercent: { type: Number, min: 0, max: 100, default: 0 },
    bookmarks: [Number], // Array of bookmarked page numbers
    // Normal Reader bookmark locations (optional)
    bookmarkLocations: [
      {
        chapter: String,
        offset: Number, // scroll offset or char index
        note: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('History', historySchema);
