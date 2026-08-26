const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const logger = require("../utils/logger");
const { buildConversationId } = require("../utils/conversation");

// Q. EVERY OTHER SERVICE IN THIS PROJECT JUST TRUSTS AN x-user-id HEADER -
//    WHY DOES chat-service VERIFY THE JWT ITSELF HERE?
// Ans - The gateway's "verify the JWT once, then forward a trusted header
// downstream" pattern only works for requests that actually PASS THROUGH the
// gateway. This module handles the live Socket.IO connection, and browsers
// connect to THAT directly on chat-service's own exposed port (see this
// service's README) - express-http-proxy (what the gateway uses) can't
// cleanly proxy a long-lived WebSocket upgrade, so this one connection
// bypasses the gateway entirely. With no gateway in the middle, there's no
// trusted header to read, so this is the one place in the whole project a
// service has to verify a JWT itself - the same way the gateway does it
// (jwt.verify with the same JWT_SECRET, reading the same `userId` claim
// identity-service puts in the token; see generateToken.js and the
// gateway's authMiddleware.js). The plain REST endpoints in
// chat-controller.js DO sit behind the gateway as normal and use the usual
// trust-the-header pattern - see routes/chat-routes.js.
function initChatSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication failed"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (e) {
      logger.warn(`Socket authentication failed: ${e.message}`);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id} (user ${socket.userId})`);

    // Every authenticated socket joins a room named after its own user id.
    // That's the entire "presence" mechanism this service needs: to deliver
    // a message to a specific user live, we just emit to a room named after
    // their user id - if they have a socket connected, it's sitting in that
    // room and receives the event; if not, the message still made it to
    // Mongo and they'll see it next time they load history over REST.
    socket.join(socket.userId);

    socket.on("send-message", async (data, callback) => {
      try {
        const { toUserId, text } = data || {};

        if (!toUserId || typeof text !== "string" || !text.trim()) {
          const error = "toUserId and non-empty text are required";
          if (typeof callback === "function") {
            callback({ success: false, error });
          }
          return;
        }

        const conversationId = buildConversationId(socket.userId, toUserId);

        const message = await Message.create({
          conversationId,
          sender: socket.userId,
          recipient: toUserId,
          text: text.trim(),
        });

        // Deliver live to the recipient's room if they're connected...
        io.to(toUserId).emit("new-message", message);
        // ...and echo back to the sender's own room too, so any other open
        // tabs/devices the sender is logged in on also see the message.
        //
        // Q. WHAT IF chat-service RUNS AS MULTIPLE INSTANCES BEHIND A LOAD
        //    BALANCER?
        // Ans - io.to(userId).emit(...) only reaches sockets connected to
        // THIS process - each instance only knows about its own rooms. A
        // message from a user connected to instance A would never reach a
        // recipient connected to instance B. Fixing that needs a shared
        // adapter (e.g. @socket.io/redis-adapter) so all instances share
        // room membership through Redis pub/sub. Intentionally not built
        // here - this service is scoped to a single instance, see README
        // "Known limitations".
        io.to(socket.userId).emit("new-message", message);

        if (typeof callback === "function") {
          callback({ success: true, message });
        }
      } catch (e) {
        logger.error("Error sending message", e);
        if (typeof callback === "function") {
          callback({ success: false, error: "Error sending message" });
        }
      }
    });

    // Socket.IO automatically removes the socket from every room it was in
    // (including the socket.userId room joined above) - nothing else to do.
    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id} (user ${socket.userId})`);
    });
  });
}

module.exports = { initChatSocket };
