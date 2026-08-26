const { eq, and, desc, count } = require("drizzle-orm");
const { db } = require("../db");
const { reviews } = require("../db/schema");

// Create a new review
async function createReview(bookId, memberId, rating, comment) {
  try {
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const review = await db.transaction(async (tx) => {
      // Check if member already reviewed this book (mirrors the unique
      // index on (book_id, member_id) in db/schema.js)
      const existingReview = await tx.query.reviews.findFirst({
        where: and(eq(reviews.bookId, bookId), eq(reviews.memberId, memberId)),
      });

      if (existingReview) {
        throw new Error("Member has already reviewed this book");
      }

      const [newReview] = await tx
        .insert(reviews)
        .values({ rating, comment, bookId, memberId })
        .returning();

      return tx.query.reviews.findFirst({
        where: eq(reviews.id, newReview.id),
        with: { book: true, member: true },
      });
    });

    return review;
  } catch (error) {
    throw new Error(`Error creating review: ${error.message}`);
  }
}

// Get all reviews with pagination
async function getAllReviews(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [reviewsList, [{ total }]] = await Promise.all([
      db.query.reviews.findMany({
        limit,
        offset: skip,
        with: { book: { with: { author: true } }, member: true },
        orderBy: desc(reviews.createdAt),
      }),
      db.select({ total: count() }).from(reviews),
    ]);

    return { data: reviewsList, total, page, pages: Math.ceil(total / limit) };
  } catch (error) {
    throw new Error(`Error fetching reviews: ${error.message}`);
  }
}

// Get reviews for a specific book
async function getReviewsByBook(bookId, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const where = eq(reviews.bookId, bookId);
    const [reviewsList, [{ total }]] = await Promise.all([
      db.query.reviews.findMany({
        where,
        limit,
        offset: skip,
        with: { member: true, book: true },
        orderBy: desc(reviews.createdAt),
      }),
      db.select({ total: count() }).from(reviews).where(where),
    ]);

    const avgRating =
      reviewsList.length > 0
        ? reviewsList.reduce((sum, review) => sum + review.rating, 0) / reviewsList.length
        : 0;

    return {
      data: reviewsList,
      averageRating: parseFloat(avgRating.toFixed(2)),
      totalReviews: total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Error fetching book reviews: ${error.message}`);
  }
}

// Get reviews by member
async function getReviewsByMember(memberId, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const where = eq(reviews.memberId, memberId);
    const [reviewsList, [{ total }]] = await Promise.all([
      db.query.reviews.findMany({
        where,
        limit,
        offset: skip,
        with: { book: { with: { author: true } }, member: true },
        orderBy: desc(reviews.createdAt),
      }),
      db.select({ total: count() }).from(reviews).where(where),
    ]);

    return { data: reviewsList, total, page, pages: Math.ceil(total / limit) };
  } catch (error) {
    throw new Error(`Error fetching member reviews: ${error.message}`);
  }
}

// Update review
async function updateReview(reviewId, rating, comment) {
  try {
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const [updated] = await db
      .update(reviews)
      .set({ rating, comment })
      .where(eq(reviews.id, reviewId))
      .returning();

    if (!updated) {
      throw new Error(`Review with id ${reviewId} not found`);
    }

    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
      with: { book: true, member: true },
    });

    return review;
  } catch (error) {
    throw new Error(`Error updating review: ${error.message}`);
  }
}

// Delete review
async function deleteReview(reviewId) {
  try {
    const [review] = await db
      .delete(reviews)
      .where(eq(reviews.id, reviewId))
      .returning();

    if (!review) {
      throw new Error(`Review with id ${reviewId} not found`);
    }

    return review;
  } catch (error) {
    throw new Error(`Error deleting review: ${error.message}`);
  }
}

// Get reviews by rating
async function getReviewsByRating(rating, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const where = eq(reviews.rating, rating);
    const [reviewsList, [{ total }]] = await Promise.all([
      db.query.reviews.findMany({
        where,
        limit,
        offset: skip,
        with: { book: true, member: true },
        orderBy: desc(reviews.createdAt),
      }),
      db.select({ total: count() }).from(reviews).where(where),
    ]);

    return { data: reviewsList, total, page, pages: Math.ceil(total / limit) };
  } catch (error) {
    throw new Error(`Error fetching reviews: ${error.message}`);
  }
}

// Get book statistics
async function getBookStatistics(bookId) {
  try {
    const bookReviews = await db.query.reviews.findMany({
      where: eq(reviews.bookId, bookId),
      columns: { rating: true },
    });

    if (bookReviews.length === 0) {
      return { totalReviews: 0, averageRating: 0, ratingDistribution: {} };
    }

    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = bookReviews.filter((r) => r.rating === i).length;
    }

    const avgRating =
      bookReviews.reduce((sum, review) => sum + review.rating, 0) / bookReviews.length;

    return {
      totalReviews: bookReviews.length,
      averageRating: parseFloat(avgRating.toFixed(2)),
      ratingDistribution,
    };
  } catch (error) {
    throw new Error(`Error fetching book statistics: ${error.message}`);
  }
}

module.exports = {
  createReview,
  getAllReviews,
  getReviewsByBook,
  getReviewsByMember,
  updateReview,
  deleteReview,
  getReviewsByRating,
  getBookStatistics,
};
