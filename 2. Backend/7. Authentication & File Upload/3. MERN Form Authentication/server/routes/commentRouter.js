// routes/commentRouter.js
const express = require("express");
const { isAuthenticated } = require("../middlewares/authMiddleware");
const {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
  likeComment,
} = require("../controllers/commentController");

const router = express.Router();

// Get comments for post
router.get("/:postId", getPostComments);

// Create comment
router.post("/:postId", isAuthenticated, createComment);

// Update comment
router.put("/:commentId", isAuthenticated, updateComment);

// Delete comment
router.delete("/:commentId", isAuthenticated, deleteComment);

// Like comment
router.post("/:commentId/like", isAuthenticated, likeComment);

module.exports = router;
