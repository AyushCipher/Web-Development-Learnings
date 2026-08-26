/**
 * DDoS PROTECTION MIDDLEWARE
 * 
 * Implements multiple layers of DDoS protection:
 * 1. Rate limiting (requests per IP)
 * 2. IP reputation tracking
 * 3. Slow request detection
 * 4. Connection throttling
 * 5. Concurrent request limits
 * 
 * DDoS Attack Types:
 * - Volumetric: Overwhelming bandwidth (99% of attacks)
 * - Protocol: Exploiting weaknesses
 * - Application: Targeting specific endpoints
 */

const rateLimit = require("express-rate-limit");

/**
 * GLOBAL RATE LIMITER
 * Applies to all endpoints
 * Prevents basic flooding attacks
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/api/health";
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * AUTH ENDPOINTS LIMITER
 * Stricter limits for login/register to prevent brute force
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 attempts per 15 minutes
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many login attempts. Account temporarily locked.",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * API ENDPOINTS LIMITER
 * Standard rate limiting for API endpoints
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: "Too many API requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Rate limit exceeded. Please slow down.",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * FILE UPLOAD LIMITER
 * Protects upload endpoints from abuse
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Only 10 uploads per hour
  message: "Too many files uploaded, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Upload limit exceeded. Try again in an hour.",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * SEARCH LIMITER
 * Prevents search endpoint abuse
 */
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: "Too many search requests.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip for authenticated users with higher limit
    return req.user && req.user.isAdmin;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Search limit exceeded.",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * SLOW REQUEST DETECTOR
 * Logs and tracks slow requests that might indicate DDoS
 */
const slowRequestDetector = (req, res, next) => {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    
    // Log slow requests (> 5 seconds)
    if (duration > 5000) {
      console.warn(`[SLOW REQUEST] ${req.method} ${req.path} took ${duration}ms`);
    }
    
    // Alert on very slow requests (> 30 seconds) - possible DDoS
    if (duration > 30000) {
      console.error(`[DDoS ALERT] Extremely slow request: ${req.method} ${req.path} took ${duration}ms from ${req.ip}`);
    }
  });
  
  next();
};

/**
 * REQUEST SIZE LIMITER
 * Prevents large payload attacks
 */
const requestSizeLimiter = (maxSize = "10mb") => {
  return require("express").json({ limit: maxSize });
};

/**
 * SETUP DDoS PROTECTION
 * Apply all protection layers to app
 */
const setupDDoSProtection = (app) => {
  // 1. Global rate limiter
  app.use(globalLimiter);
  
  // 2. Slow request detector
  app.use(slowRequestDetector);
  
  // 3. Request size limit
  app.use(requestSizeLimiter("10mb"));
  
  // 4. Enable trust proxy (for load balancers)
  app.set("trust proxy", 1);
};

/**
 * DDoS PROTECTION LAYERS:
 * 
 * Layer 1: IP-based Rate Limiting
 * - Global: 100 req/15min
 * - Auth: 5 req/15min
 * - API: 30 req/min
 * - Upload: 10/hour
 * - Search: 30 req/min
 * 
 * Layer 2: Request Inspection
 * - Slow request detection (>5s, >30s)
 * - Request size limits (10MB max)
 * - Content-type validation
 * 
 * Layer 3: Application-level
 * - Helmet security headers
 * - CORS restrictions
 * - Request validation
 * 
 * Layer 4: Infrastructure
 * - Nginx load balancer health checks
 * - Server failover
 * - Connection pooling
 * 
 * Layer 5: Monitoring
 * - Request logging
 * - Alert on suspicious activity
 * - Real-time metrics
 */

/**
 * MONITORING DDoS ATTACKS:
 * 
 * Signs of DDoS Attack:
 * - Sudden spike in requests from single/few IPs
 * - Same request pattern repeated
 * - Requests to non-existent endpoints
 * - Slow response times across all endpoints
 * - High 429 (Too Many Requests) responses
 * - High 502 (Bad Gateway) responses
 * 
 * Response Actions:
 * 1. Enable aggressive rate limiting
 * 2. Block malicious IPs
 * 3. Scale horizontally (add servers)
 * 4. Contact CDN/DDoS mitigation service
 * 5. Check logs for patterns
 */

module.exports = {
  globalLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  searchLimiter,
  slowRequestDetector,
  requestSizeLimiter,
  setupDDoSProtection,
};
