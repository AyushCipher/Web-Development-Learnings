const express = require("express");
const router = express.Router();
const {register, verifyOTP, login, logout, getUser, forgotPassword, resetPassword} = require("../controllers/userController");
const {isAuthenticated, authorizeRoles} = require("../middlewares/auth");

router.post("/register", register);
router.post("/otp-verification", verifyOTP);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

// Admin dashboard stats
router.get("/dashboard/stats", isAuthenticated, authorizeRoles("admin"), async (req, res) => {
  try {
    const User = require("../models/userModel");
    const Post = require("../models/postModel");
    const Comment = require("../models/commentModel");

    const totalStudents = await User.countDocuments({ role: "student" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalPosts = await Post.countDocuments();
    const totalComments = await Comment.countDocuments();
    const adminPosts = await Post.countDocuments({ admin: req.user._id });

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalAdmins,
        totalPosts,
        totalComments,
        adminPosts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Student route
router.get("/student", isAuthenticated, authorizeRoles("student"), (req, res) => {
  res.json({ success: true, message: "Welcome student!", user: req.user });
});

// Admin route
router.get("/admin", isAuthenticated, authorizeRoles("admin"), (req, res) => {
  res.json({ success: true, message: "Welcome admin!", user: req.user });
});

module.exports = router;
