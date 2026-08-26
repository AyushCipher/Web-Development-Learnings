const redis = require("../config/redis");

// Q. HOW DOES THIS ACTUALLY BLOCK ABUSE, WITHOUT US HAVING TO RESET ANYTHING?
// ANS: INCR on a key that doesn't exist yet creates it starting at 1 - so
// the FIRST request from an IP starts a fresh counter, and that's the exact
// moment we attach a TTL to it with EXPIRE. Every request after that just
// increments the same counter until the TTL runs out and Redis deletes the
// key on its own, silently resetting the count back to zero - same
// auto-expiry idea as the OTP storage in otp.service.js.

function rateLimiter({ windowSeconds, max, keyPrefix = "rate_limit" }) {
  return async function rateLimiterMiddleware(req, res, next) {
    const key = `${keyPrefix}:${req.ip}`;
    const requests = await redis.incr(key);

    if (requests === 1) {
      await redis.expire(key, windowSeconds);
    }

    if (requests > max) {
      const retryAfterSeconds = await redis.ttl(key);
      return res.status(429).json({
        success: false,
        message: "Too many requests, please try again later",
        retryAfterSeconds,
      });
    }

    next();
  };
}

module.exports = rateLimiter;
