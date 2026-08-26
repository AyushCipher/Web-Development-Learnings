const express = require("express");
const {
  listConversations,
  getMessages,
} = require("../controllers/chat-controller");
const { authenticateRequest } = require("../middleware/authMiddleware");

const router = express.Router();

// These REST routes sit behind the gateway like every other service's
// routes, so they use the same trust-the-x-user-id-header pattern as
// post-service - see authMiddleware.js. This is separate from the Socket.IO
// handshake auth in src/socket/chatSocket.js, which verifies a JWT directly
// because the live socket connection bypasses the gateway (see that file).
router.use(authenticateRequest);

router.get("/conversations", listConversations);
router.get("/messages/:otherUserId", getMessages);

module.exports = router;
