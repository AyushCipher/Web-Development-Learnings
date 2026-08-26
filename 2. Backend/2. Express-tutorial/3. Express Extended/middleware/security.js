/**
 * HELMET SECURITY MIDDLEWARE
 * 
 * Helmet helps secure Express apps by setting various HTTP headers
 * It provides protection against:
 * - DDoS attacks
 * - Clickjacking
 * - Cross-Site Scripting (XSS)
 * - MIME type sniffing
 * - Insecure HTTP
 * - Brute force attacks
 * 
 * What Helmet does:
 * 1. Sets Content-Security-Policy header
 * 2. Removes X-Powered-By header
 * 3. Sets Strict-Transport-Security (HTTPS)
 * 4. Prevents MIME type sniffing
 * 5. Prevents clickjacking (X-Frame-Options)
 * 6. Enables XSS filter
 * 7. Removes Referrer Information
 */

const helmet = require("helmet");

/**
 * Configure Helmet with custom options
 */
const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  
  // Strict Transport Security
  // Forces HTTPS after first visit
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  
  // Prevent clickjacking
  // Restricts iframe embedding
  frameguard: {
    action: "deny", // Options: 'deny', 'sameorigin', 'allow-from'
  },
  
  // Prevent MIME type sniffing
  noSniff: true,
  
  // Enable XSS filter
  xssFilter: true,
  
  // Referrer Policy
  // Prevents sensitive URL information in referrer header
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },
  
  // Permissions Policy (formerly Feature-Policy)
  // Control which browser features can be used
  permissionsPolicy: {
    features: {
      geolocation: ["()"],
      microphone: ["()"],
      camera: ["()"],
      magnetometer: ["()"],
      gyroscope: ["()"],
      accelerometer: ["()"],
      payment: ["()"],
    },
  },
});

/**
 * Express middleware for Helmet
 * Add to app.use() in server.js
 */
const setupHelmet = (app) => {
  // Apply Helmet to all routes
  app.use(helmetConfig);
  
  // Additional security headers
  app.use((req, res, next) => {
    // Remove X-Powered-By header
    res.removeHeader("X-Powered-By");
    
    // Add custom security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    
    next();
  });
};

/**
 * Helmet security levels:
 * 
 * Level 1 (Basic)
 * - Remove X-Powered-By
 * - Enable XSS filter
 * - MIME type sniffing prevention
 * - Clickjacking protection (deny all iframes)
 * 
 * Level 2 (Recommended - Current Setup)
 * - Level 1 +
 * - HSTS (Force HTTPS)
 * - Content Security Policy
 * - Referrer Policy
 * - Permissions Policy
 * 
 * Level 3 (Strict - For high-security apps)
 * - Level 2 +
 * - Stricter CSP
 * - Report-To header
 * - Feature-Policy restrictions
 */

module.exports = {
  helmetConfig,
  setupHelmet,
};

/**
 * SECURITY HEADERS EXPLAINED:
 * 
 * 1. Content-Security-Policy (CSP)
 *    - Prevents inline scripts and styles
 *    - Restricts resource loading sources
 *    - Prevents XSS attacks
 *    
 * 2. Strict-Transport-Security (HSTS)
 *    - Forces HTTPS connection
 *    - Prevents man-in-the-middle attacks
 *    - Browser remembers for maxAge seconds
 *    
 * 3. X-Frame-Options
 *    - Prevents clickjacking
 *    - deny: No embedding in frames
 *    - sameorigin: Allow same-origin frames
 *    
 * 4. X-Content-Type-Options: nosniff
 *    - Prevents MIME type sniffing
 *    - Browser respects Content-Type header
 *    
 * 5. X-XSS-Protection
 *    - Enables browser XSS filter
 *    - Modern browsers have built-in protection
 *    
 * 6. Referrer-Policy
 *    - Controls referrer information
 *    - Prevents sensitive URL leakage
 *    
 * 7. Permissions-Policy
 *    - Controls browser features
 *    - Restricts geolocation, camera, microphone, etc.
 */
