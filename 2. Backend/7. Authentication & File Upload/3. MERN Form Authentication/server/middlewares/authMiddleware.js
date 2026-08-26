// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.accountVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account first",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can perform this action",
      });
    }

    next();
  } catch (error) {
    console.error("Admin Check Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const isStudent = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "This action is only for students",
      });
    }

    next();
  } catch (error) {
    console.error("Student Check Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isStudent,
};
