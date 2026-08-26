const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a new review
async function createReview(bookId, memberId, rating, comment) {
  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const review = await prisma.$transaction(async (tx) => {
      // Check if member already reviewed this book
      const existingReview = await tx.review.findUnique({
        where: {
          bookId_memberId: { bookId, memberId },
        },
      });

      if (existingReview) {
        throw new Error("Member has already reviewed this book");
      }

      // Create the review
      return tx.review.create({
        data: {
          rating,
          comment,
          book: { connect: { id: bookId } },
          member: { connect: { id: memberId } },
        },
        include: {
          book: true,
          member: true,
        },
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
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        skip,
        take: limit,
        include: {
          book: { include: { author: true } },
          member: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.count(),
    ]);

    return {
      data: reviews,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Error fetching reviews: ${error.message}`);
  }
}

// Get reviews for a specific book
async function getReviewsByBook(bookId, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { bookId },
        skip,
        take: limit,
        include: {
          member: true,
          book: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.count({ where: { bookId } }),
    ]);

    // Calculate average rating
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    return {
      data: reviews,
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
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { memberId },
        skip,
        take: limit,
        include: {
          book: { include: { author: true } },
          member: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.count({ where: { memberId } }),
    ]);

    return {
      data: reviews,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
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

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        comment,
      },
      include: {
        book: true,
        member: true,
      },
    });

    return review;
  } catch (error) {
    throw new Error(`Error updating review: ${error.message}`);
  }
}

// Delete review
async function deleteReview(reviewId) {
  try {
    const review = await prisma.review.delete({
      where: { id: reviewId },
    });

    return review;
  } catch (error) {
    throw new Error(`Error deleting review: ${error.message}`);
  }
}

// Get reviews by rating
async function getReviewsByRating(rating, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { rating },
        skip,
        take: limit,
        include: {
          book: true,
          member: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.count({ where: { rating } }),
    ]);

    return {
      data: reviews,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Error fetching reviews: ${error.message}`);
  }
}

// Get book statistics
async function getBookStatistics(bookId) {
  try {
    const reviews = await prisma.review.findMany({
      where: { bookId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {},
      };
    }

    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = reviews.filter((r) => r.rating === i).length;
    }

    const avgRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    return {
      totalReviews: reviews.length,
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
