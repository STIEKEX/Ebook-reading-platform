const mongoose = require('mongoose');

const favoriteLineSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    text: { type: String, required: true, maxlength: 2000 },
    chapter: { type: String },
    location: {
      paragraphIndex: { type: Number },
      charStart: { type: Number },
      charEnd: { type: Number },
      offset: { type: Number },
    },
    color: { type: String, default: '#ffd54f' },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FavoriteLine', favoriteLineSchema);
