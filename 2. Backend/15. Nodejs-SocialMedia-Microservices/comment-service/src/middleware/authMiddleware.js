const logger = require("../utils/logger");

// Q. Why does this middleware just trust the `x-user-id` header instead of verifying a JWT itself?
// ANS: The API gateway (api-gateway/src/middleware/authMiddleware.js) already verified the JWT
// signature before proxying the request here, and attaches the trusted user id as this header.
// Re-verifying the JWT at every downstream hop would mean every service needs the JWT secret and
// repeats the same work for no benefit — in the deployed topology this service is never reachable
// directly from outside, only through the gateway.
const authenticateRequest = (req, res, next) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    logger.warn(`Access attempted without user ID`);
    return res.status(401).json({
      success: false,
      message: "Authencation required! Please login to continue",
    });
  }

  req.user = { userId };
  next();
};

module.exports = { authenticateRequest };
