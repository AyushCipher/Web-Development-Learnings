const reviewService = require("../services/reviewService");

// Create review
exports.createReview = async (req, res) => {
  try {
    const { bookId, memberId, rating, comment } = req.body;

    if (!bookId || !memberId || !rating) {
      return res
        .status(400)
        .json({ error: "Book ID, Member ID, and rating are required" });
    }

    const review = await reviewService.createReview(bookId, memberId, rating, comment);
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await reviewService.getAllReviews(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reviews by book
exports.getReviewsByBook = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await reviewService.getReviewsByBook(
      parseInt(req.params.bookId),
      page,
      limit
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reviews by member
exports.getReviewsByMember = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await reviewService.getReviewsByMember(
      parseInt(req.params.memberId),
      page,
      limit
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ error: "Rating is required" });
    }

    const review = await reviewService.updateReview(
      parseInt(req.params.id),
      rating,
      comment
    );

    res.json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    await reviewService.deleteReview(parseInt(req.params.id));
    res.json({ message: `Review deleted with id ${req.params.id}` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get reviews by rating
exports.getReviewsByRating = async (req, res) => {
  try {
    const { rating } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ error: "Rating must be between 1 and 5" });
    }

    const result = await reviewService.getReviewsByRating(
      parseInt(rating),
      page,
      limit
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get book statistics
exports.getBookStatistics = async (req, res) => {
  try {
    const stats = await reviewService.getBookStatistics(parseInt(req.params.bookId));
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
