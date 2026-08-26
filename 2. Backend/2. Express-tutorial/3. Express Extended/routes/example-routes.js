/**
 * EXAMPLE ROUTES WITH SECURITY & VALIDATION
 * 
 * This file demonstrates:
 * - How to use validators
 * - How to apply rate limiting
 * - Error handling patterns
 * - Logging integration
 */

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../config/logger");
const { authLimiter, apiLimiter } = require("../middleware/ddosProtection");
const { User } = require("../config/database");
const Item = require("../models/Item");
const {
  validate,
  validateQuery,
  validateRegistration,
  validateLogin,
  validateItemCreation,
  validatePagination,
} = require("../utils/validators");

const router = express.Router();

/**
 * AUTHENTICATION ROUTES
 */

/**
 * POST /auth/register
 * Register a new user
 * - Rate limited: 5 attempts/15 min
 * - Validation: username, email, password
 */
router.post(
  "/auth/register",
  authLimiter, // Apply rate limiter
  validate(validateRegistration), // Validate request body
  async (req, res) => {
    try {
      const { username, email, password } = req.body;

      logger.info("User registration attempt", {
        username,
        email,
        ip: req.ip,
      });

      // Q. WHY database.js's User MODEL (name/email/password) EVEN THOUGH
      //    THE ROUTE ALSO COLLECTS "username"?
      // ANS: That model was already built with a `name` field, not
      // `username` - rather than touching its schema (and risking
      // breaking whatever else in this repo might reference it), username
      // is stored into `name` here. A real project would either rename
      // the schema field or add both, but for this fix the goal is
      // wiring the existing, already-correct model up to real requests -
      // not redesigning it.
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "A user with that email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(
        password,
        Number(process.env.SALT_ROUNDS) || 10
      );

      const user = await User.create({
        name: username,
        email,
        password: hashedPassword,
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: user._id,
          username: user.name,
          email: user.email,
        },
      });

      logger.info("User registered successfully", {
        username,
        email,
      });
    } catch (error) {
      logger.error("Registration error", {
        error: error.message,
        username: req.body.username,
      });

      res.status(500).json({
        success: false,
        message: "Registration failed",
        error: error.message,
      });
    }
  }
);

/**
 * POST /auth/login
 * User login
 * - Rate limited: 5 attempts/15 min (prevents brute force)
 * - Validation: email, password
 */
router.post(
  "/auth/login",
  authLimiter, // Strict rate limiting for brute force protection
  validate(validateLogin),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      logger.info("Login attempt", {
        email,
        ip: req.ip,
        userAgent: req.get("user-agent"),
      });

      const user = await User.findOne({ email });
      // Deliberately the SAME "Invalid credentials" message whether the
      // email doesn't exist or the password is wrong (see the catch
      // block below too) - a distinct "no such user" response would let
      // an attacker enumerate which emails are registered just by
      // observing which error they get back.
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "7d" }
      );

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.name,
          email: user.email,
        },
      });

      logger.info("User logged in", {
        email,
        ip: req.ip,
      });
    } catch (error) {
      logger.error("Login error", {
        error: error.message,
        email: req.body.email,
        ip: req.ip,
      });

      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  }
);

/**
 * API ROUTES
 */

/**
 * POST /api/items
 * Create a new item
 * - Rate limited: 30 requests/minute
 * - Validation: title, description, category, price
 */
router.post(
  "/products",
  apiLimiter,
  validate(validateItemCreation),
  async (req, res) => {
    try {
      const { title, description, category, price, stock } = req.body;

      logger.info("Item creation request", {
        title,
        category,
        price,
        userId: req.user?.id || "anonymous",
      });

      const item = await Item.create({ title, description, category, price, stock });

      res.status(201).json({
        success: true,
        message: "Item created successfully",
        item,
      });

      logger.info("Item created", {
        id: item._id,
        title,
        category,
      });
    } catch (error) {
      logger.error("Item creation error", {
        error: error.message,
        title: req.body.title,
      });

      res.status(500).json({
        success: false,
        message: "Failed to create item",
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/items
 * Get paginated list of items
 * - Rate limited: 30 requests/minute
 * - Query validation: page, limit, sort
 */
router.get(
  "/products",
  apiLimiter,
  validateQuery(validatePagination),
  async (req, res) => {
    try {
      const { page, limit, sort } = req.query;

      logger.info("Items list requested", {
        page,
        limit,
        sort,
        userId: req.user?.id || "anonymous",
      });

      const sortMap = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        popular: { stock: -1 }, // no real "popularity" field on Item - stock is the closest proxy available
      };

      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        Item.find().sort(sortMap[sort]).skip(skip).limit(limit),
        Item.countDocuments(),
      ]);

      res.json({
        success: true,
        message: "Items retrieved successfully",
        data: items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error("Items list error", {
        error: error.message,
        page: req.query.page,
      });

      res.status(500).json({
        success: false,
        message: "Failed to retrieve items",
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/items/:id
 * Get single item by ID
 */
router.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    logger.debug("Item detail requested", {
      itemId: id,
      userId: req.user?.id || "anonymous",
    });

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.json({
      success: true,
      message: "Item retrieved successfully",
      item,
    });
  } catch (error) {
    logger.error("Item detail error", {
      error: error.message,
      itemId: req.params.id,
    });

    res.status(500).json({
      success: false,
      message: "Failed to retrieve item",
    });
  }
});

/**
 * DELETE /api/items/:id
 * Delete an item
 */
router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    logger.info("Item deletion requested", {
      itemId: id,
      userId,
    });

    // Authorization intentionally not added here - this example-routes.js
    // demo doesn't have an auth middleware attaching req.user anywhere
    // (see server.js/auth middleware - there isn't one wired up), so
    // gating deletion on req.user would make this route unreachable for
    // literally every caller rather than actually protecting it.
    const deleted = await Item.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.json({
      success: true,
      message: "Item deleted successfully",
    });

    logger.info("Item deleted", {
      itemId: id,
      userId,
    });
  } catch (error) {
    logger.error("Item deletion error", {
      error: error.message,
      itemId: req.params.id,
    });

    res.status(500).json({
      success: false,
      message: "Failed to delete item",
    });
  }
});

/**
 * ERROR HANDLING
 * Centralized error handler
 */
router.use((error, req, res, next) => {
  logger.error("Unhandled error", {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    error:
      process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
});

/**
 * LOGGING PATTERNS:
 * 
 * logger.info() - General information
 * Usage: User actions, successful operations
 * 
 * logger.warn() - Warnings
 * Usage: Deprecated features, unusual patterns
 * 
 * logger.error() - Errors
 * Usage: Failed operations, exceptions
 * 
 * logger.debug() - Debug information
 * Usage: Detailed application flow
 * 
 * logger.silly() - Very detailed info
 * Usage: Deep debugging
 */

module.exports = router;
