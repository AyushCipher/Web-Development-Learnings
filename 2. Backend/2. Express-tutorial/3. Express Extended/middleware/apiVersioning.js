// API VERSIONING - Intermediate Implementation:

// Q. WHAT IS API VERSIONING?
// ANS: API Versioning is the practice of maintaining multiple versions of the same API so that existing clients can continue using older versions while newer clients can use updated functionality. 
// It allows backend developers to improve, modify, or redesign APIs without breaking applications that depend on previous versions.

// Example:
// /api/v1/users
// /api/v2/users
// /api/v3/users

// Different clients can consume different versions simultaneously.


// Q. WHY IS API VERSIONING IMPORTANT?
// ANS: API Versioning is important because it allows you to maintain backward compatibility while evolving your API. 
// It ensures that existing clients can continue to use the API without breaking their applications, 
// while also providing a way for new clients to access the latest features and improvements.

// EXAMPLE: Imagine your social media application releases:

// {
//   "name": "Ayush"
// }

// in version 1.

// Thousands of frontend applications start using it.

// Later you decide to change the response to:

// {
//   "firstName": "Ayush",
//   "lastName": "Verma"
// }

// Without versioning, every old frontend expecting name would immediately break.

// API versioning solves this problem by allowing:
// v1 → old response
// v2 → new response

// Both continue working until clients migrate.



// Q. HOW API VERSIONING WORKS?
// ANS: When a request reaches the backend, the server determines which version the client wants and routes the request to the appropriate implementation.

// Example:

// Client Request
//       ↓
// API Gateway
//       ↓
// Check Version
//       ↓
// v1 ? → Use V1 Logic
// v2 ? → Use V2 Logic
// v3 ? → Use V3 Logic
//       ↓
// Return Response


// Each version may have:
// * different routes
// * different controllers
// * different response structures
// * different business logic




// 1. URL-BASED VERSIONING (Most Common)

// /api/v1/users
// /api/v2/users

// Advantages:
// * easy to understand
// * visible in URLs
// * simple to maintain

// Most companies use this approach.

const urlVersioning = (version) => (req, res, next) => {
  if (req.path.startsWith(`/api/${version}`)) {
    // Version matches, allow request
    req.apiVersion = version;
    next();
  } else {
    // Version mismatch
    res.status(404).json({
      success: false,
      error: `API version ${version} is not supported`,
      availableVersions: ['v1', 'v2', 'v3'],
      migration: `Please migrate to latest API version. See https://docs.api.com/migration`
    });
  }
};



// Multiple version support example: Accept both v1 and v2, but discourage v1
const multiVersionURLSupport = (req, res, next) => {
  const path = req.path;
  
  if (path.startsWith('/api/v1')) {
    req.apiVersion = 'v1';
    res.setHeader('Deprecation', 'true');
    res.setHeader('Sunset', new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString());
    res.setHeader('Warning', '299 - "API v1 deprecated. Migrate to v2" (https://docs.api.com/migration)');
    next();
  } else if (path.startsWith('/api/v2')) {
    req.apiVersion = 'v2';
    next();
  } else if (path.startsWith('/api/v3')) {
    req.apiVersion = 'v3';
    next();
  } else {
    res.status(404).json({
      success: false,
      error: "Unknown API version"
    });
  }
};



// 2. HEADER-BASED VERSIONING:

// Example:
// GET /api/users

// Accept-Version: v2
// The version is sent inside a custom HTTP header instead of the URL.

//  Advantages:
//  * Cleaner URLs
//  * Follows REST principles

// Disadvantages:
//  * Less visible in logs/browser
//  * Harder to cache by version

const headerVersioning = (version) => (req, res, next) => {
  const clientVersion = req.get("Accept-Version");
  
  if (clientVersion === version) {
    req.apiVersion = version;
    next();
  } else {
    res.status(406).json({
      success: false,
      error: `API version ${version} not found`,
      clientProvided: clientVersion,
      availableVersions: ['v1', 'v2', 'v3'],
      hint: "Set Accept-Version header to request specific version"
    });
  }
};


// Flexible header versioning: Support multiple versions, prefer new but allow old
const flexibleHeaderVersioning = (req, res, next) => {
  let clientVersion = req.get("Accept-Version");
  const supportedVersions = ['v1', 'v2', 'v3'];
  
  if (!clientVersion) {
    // Default to latest if no version specified
    clientVersion = 'v3';
    res.setHeader('API-Version', clientVersion);
  }
  
  if (supportedVersions.includes(clientVersion)) {
    req.apiVersion = clientVersion;
    res.setHeader('API-Version', clientVersion);
    
    // Add deprecation warning for old versions
    if (clientVersion === 'v1') {
      res.setHeader('Deprecation', 'true');
      res.setHeader('Sunset', new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString());
    }
    next();
  } else {
    res.status(406).json({
      success: false,
      error: `API version ${clientVersion} not supported`,
      supportedVersions,
      defaultVersion: 'v3'
    });
  }
};



// 3. CONTENT-TYPE VERSIONING (Vendor Mime Types)
// Example:
// Content-Type: application/vnd.api.v2+json

// Version is embedded inside the content type.

// Mostly used in advanced REST systems.


// REAL EXAMPLE OF SOCIAL MEDIA PROJECT:
// Current:
// /api/v1/posts

// Suppose later you add:

// * AI-generated captions
// * Post analytics
// * Advanced privacy settings

// Instead of modifying v1 directly:
// * /api/v1/posts
// * /api/v2/posts


// Advantages:
//  * Semantically correct per REST
//  * Works with content negotiation
//  * 
// Disadvantages:
//  * Complex to understand
//  * Not widely used

const contentTypeVersioning = (version) => (req, res, next) => {
  const contentType = req.get("Content-Type") || "";
  const vendorType = `application/vnd.api.${version}+json`;
  
  if (contentType.includes(vendorType)) {
    req.apiVersion = version;
    next();
  } else {
    res.status(415).json({
      success: false,
      error: `Unsupported Media Type`,
      expectedContentType: vendorType,
      received: contentType,
      hint: "Use correct Content-Type header for API versioning"
    });
  }
};



// Flexible content-type negotiation: Support multiple content types with versioning
const flexibleContentTypeVersioning = (req, res, next) => {
  const contentType = req.get("Content-Type") || "application/json";
  const supportedVersions = ['v1', 'v2', 'v3'];
  
  // Extract version from vendor MIME type
  // Example: application/vnd.api.v2+json → v2
  const versionMatch = contentType.match(/application\/vnd\.api\.(\w+)\+json/);
  const version = versionMatch ? versionMatch[1] : 'v3'; // Default to latest
  
  if (supportedVersions.includes(version)) {
    req.apiVersion = version;
    res.setHeader('Content-Type', `application/vnd.api.${version}+json`);
    next();
  } else {
    res.status(415).json({
      success: false,
      error: "Unsupported API version in Content-Type"
    });
  }
};


// 5. HANDLING VERSION DEPRECATION: 

//  * Mark old versions as deprecated
//  * Notify clients to upgrade

const deprecationMiddleware = (req, res, next) => {
  const version = req.apiVersion;
  const deprecatedVersions = {
    'v1': {
      deprecatedAt: '2024-01-01',
      sunsetDate: '2025-01-01',
      reason: 'Performance improvements in v2'
    },
    'v2': {
      deprecatedAt: '2024-06-01',
      sunsetDate: '2025-12-01',
      reason: 'Security updates in v3'
    }
  };
  
  if (deprecatedVersions[version]) {
    const info = deprecatedVersions[version];
    res.setHeader('Deprecation', 'true');
    res.setHeader('Sunset', new Date(info.sunsetDate).toUTCString());
    res.setHeader('Warning', `299 - "Version ${version} deprecated on ${info.deprecatedAt}. ${info.reason}"`);
    res.setHeader('Link', `</api/v3>; rel="latest-version"`);
  }
  next();
};

module.exports = {
  urlVersioning,
  multiVersionURLSupport,
  headerVersioning,
  flexibleHeaderVersioning,
  contentTypeVersioning,
  flexibleContentTypeVersioning,
  deprecationMiddleware,
};

