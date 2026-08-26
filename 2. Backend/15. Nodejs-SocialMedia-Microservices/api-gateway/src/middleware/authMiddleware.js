const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");

// Q. WHY IS THE JWT VERIFIED HERE, AT THE GATEWAY, AND NOT AGAIN INSIDE
//    EVERY DOWNSTREAM SERVICE?
// ANS: This is the only place in the whole system that checks a JWT
// signature. Once verified, the gateway attaches the trusted user id as an
// `x-user-id` header on the proxied request (see server.js's
// proxyReqOptDecorator for each route) - every downstream service just
// trusts that header instead of re-verifying (see their own
// authMiddleware.js). That means only the gateway needs the JWT secret at
// all, and the same verification work doesn't happen 8 times per request.
const validateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.warn("Access attempt without valid token!");
    return res.status(401).json({
      message: "Authentication required",
      success: false,
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn("Invalid token!");
      return res.status(401).json({
        message: "Invalid token!",
        success: false,
      });
    }

    req.user = user;
    next();
  });
};

module.exports = { validateToken };
