const express = require("express");
const {
  listNotifications,
  markAsRead,
} = require("../controllers/notification-controller");
const { authenticateRequest } = require("../middleware/authMiddleware");

const router = express.Router();

// middleware -> notifications are inherently per-user, always protected
router.use(authenticateRequest);

router.get("/", listNotifications);
router.patch("/:id/read", markAsRead);

module.exports = router;
