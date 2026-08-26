const express = require("express");
const authController = require("../controllers/auth.controller");
const requireAuth = require("../middleware/requireAuth");
const rateLimiter = require("../middleware/rateLimiter");

const router = express.Router();

// Brute-force protection on the two endpoints where guessing matters:
// guessing a password (login) and guessing a 6-digit OTP (verify-otp).
const loginLimiter = rateLimiter({ windowSeconds: 60, max: 5, keyPrefix: "rate_limit:login" });
const otpLimiter = rateLimiter({ windowSeconds: 60, max: 5, keyPrefix: "rate_limit:verify-otp" });

router.post("/signup", authController.signup);
router.post("/login", loginLimiter, authController.login);
router.post("/verify-otp", otpLimiter, authController.verifyOtp);
router.post("/logout", requireAuth, authController.logout);

module.exports = router;
