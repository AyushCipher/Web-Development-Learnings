const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// ✅ Authenticated middleware
const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized. No token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id).select("-password"); // attach user to request
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token is invalid or expired." });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied for role: ${req.user.role}`,
      });
    }
    next();
  };
};

module.exports = {
  isAuthenticated,
  authorizeRoles,
};
