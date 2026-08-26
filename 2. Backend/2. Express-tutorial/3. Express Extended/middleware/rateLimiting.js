// Q. WHAT IS RATE LIMITING?
// ANS: Rate limiting is a security and traffic-control mechanism that restricts how many requests a client can make to a server within a specific time period. 
// It prevents users, bots, or malicious attackers from sending excessive requests that could overload the server, abuse APIs, perform brute-force attacks, or consume excessive resources.
// When the defined request limit is exceeded, the server temporarily blocks further requests and returns an HTTP 429 (Too Many Requests) response.


// Q. WHY IS RATE LIMITING NECESSARY?
// ANS: Without rate limiting, a user or attacker could continuously send thousands of requests per second to your backend. 
// This can lead to server overload, increased infrastructure costs, denial-of-service attacks, API abuse, credential stuffing attacks, brute-force login attempts, and degraded performance for legitimate users. 
// Rate limiting ensures fair usage of resources, protects backend services from abuse, improves system stability, and enhances application security.

// Example: Login API

// Without Rate Limiting:
// Attacker → 10000 password attempts

// With Rate Limiting:
// Attacker → 5 attempts / 15 min

// Brute-force attacks become extremely difficult.



// Q. HOW DOES RATE LIMITING WORK?
// ANS: When a request reaches the server, the rate limiter identifies the client using a unique key such as:

// * IP Address
// * User ID
// * API Key
// * JWT User ID

// The rate limiter then checks how many requests have already been made within the configured time window.

// Example:

// Limit = 5 requests per minute

// Workflow:

// Request 1 → Allowed ✅
// Request 2 → Allowed ✅
// Request 3 → Allowed ✅
// Request 4 → Allowed ✅
// Request 5 → Allowed ✅
// Request 6 → Blocked ❌

// Server returns:

// HTTP 429 Too Many Requests

//  After the time window expires, the counter resets and requests are allowed again.



// 1. Basic Rate Limiting: Limit requests per IP address to prevent flooding and abuse
const rateLimit = require("express-rate-limit");

const createBasicRateLimiter = (maxRequests, timeWindowMs) => {
  return rateLimit({
    max: maxRequests,
    windowMs: timeWindowMs,
    message: "Too many requests, please try again later",
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === "/health",
    keyGenerator: (req) => req.ip,
    handler: (req, res, options) => {
      res.status(options.statusCode).json({
        success: false,
        error: options.message,
        retryAfter: req.rateLimit.resetTime,
      });
    },
  });
};


// 2. Specialized Rate Limiters: Create different limiters for authentication and API endpoints
const authRateLimiter = rateLimit({
  max: 5,
  windowMs: 15 * 60 * 1000,
  message: "Too many login attempts, please try again later",
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health",
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Too many login attempts",
      retryAfter: 900,
    });
  },
});


// 3. API Rate Limiting with User Identification: Use user ID from JWT for more accurate rate limiting
const apiRateLimiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "API rate limit exceeded",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "API rate limit exceeded",
      limit: 100,
      window: "1 hour",
      remainingRequests: req.rateLimit.remaining,
    });
  },
});

module.exports = {
  createBasicRateLimiter,
  authRateLimiter,
  apiRateLimiter,
};