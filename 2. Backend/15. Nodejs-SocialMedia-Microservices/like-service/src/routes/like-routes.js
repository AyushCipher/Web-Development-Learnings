const express = require("express");
const {
  toggleLike,
  getLikeCount,
  getMyLikeStatus,
} = require("../controllers/like-controller");
const { authenticateRequest } = require("../middleware/authMiddleware");

const router = express.Router();

// liking is a write, and knowing "did I like this" / the count both need to
// know who is asking (count doesn't strictly need the user, but every route
// here is kept behind auth for consistency with the rest of this service)
router.use(authenticateRequest);

router.post("/:postId", toggleLike);
router.get("/:postId/count", getLikeCount);
router.get("/:postId/mine", getMyLikeStatus);

module.exports = router;
