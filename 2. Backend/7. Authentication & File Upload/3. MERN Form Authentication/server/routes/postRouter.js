// routes/postRouter.js
const express = require("express");
const { isAuthenticated, isAdmin } = require("../middlewares/authMiddleware");
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getAdminPosts,
  getUserStats,
} = require("../controllers/postController");

const router = express.Router();

// Get all posts (public)
router.get("/", getAllPosts);

// Get single post (public)
router.get("/:postId", getPostById);

// Create post (admin only)
router.post("/", isAuthenticated, isAdmin, createPost);

// Update post (admin only)
router.put("/:postId", isAuthenticated, isAdmin, updatePost);

// Delete post (admin only)
router.delete("/:postId", isAuthenticated, isAdmin, deletePost);

// Like post (authenticated users)
router.post("/:postId/like", isAuthenticated, likePost);

// Get admin posts
router.get("/admin/my-posts", isAuthenticated, isAdmin, getAdminPosts);

// Get stats
router.get("/stats/all", getUserStats);

module.exports = router;
