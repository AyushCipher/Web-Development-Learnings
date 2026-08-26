const express = require("express");
const reviewController = require("../controllers/reviewController");

const router = express.Router();

router.post("/", reviewController.createReview);
router.get("/", reviewController.getAllReviews);
router.get("/rating/:rating", reviewController.getReviewsByRating);
router.get("/book/:bookId", reviewController.getReviewsByBook);
router.get("/book/:bookId/stats", reviewController.getBookStatistics);
router.get("/member/:memberId", reviewController.getReviewsByMember);
router.put("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
