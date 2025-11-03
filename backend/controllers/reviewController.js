const Review = require('../models/Review');
const Book = require('../models/Book');

// ADD/UPDATE REVIEW
exports.addReview = async (req, res) => {
  try {
    const { bookId, rating, text } = req.body;
    const userId = req.userId;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user already reviewed
    let review = await Review.findOne({ bookId, userId });
    if (review) {
      review.rating = rating;
      review.text = text;
    } else {
      review = new Review({ bookId, userId, rating, text });
    }

    await review.save();

    // Update book rating
    const reviews = await Review.find({ bookId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Book.findByIdAndUpdate(bookId, {
      averageRating: avgRating,
      totalReviews: reviews.length,
    });

    res.json({ message: 'Review saved', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET REVIEWS FOR BOOK
exports.getReviews = async (req, res) => {
  try {
    const { bookId } = req.params;
    const reviews = await Review.find({ bookId }).populate('userId', 'username profile');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET USER'S REVIEW FOR A BOOK
exports.getUserReview = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.userId;

    const review = await Review.findOne({ bookId, userId });
    if (!review) {
      return res.json(null);
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
