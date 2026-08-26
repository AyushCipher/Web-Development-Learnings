const logger = require("../utils/logger");

// Q. WHY DOES THIS FUNCTION TAKE 4 ARGUMENTS (err, req, res, next) WHEN NO
//    OTHER MIDDLEWARE IN THIS SERVICE DOES?
// ANS: This is how Express itself decides a function is an ERROR handler
// rather than a normal middleware - the 4-argument signature is a hard
// requirement of the framework, not a stylistic choice. Express skips
// straight to whichever error-handling middleware is mounted (always last,
// via app.use(errorHandler) at the bottom of server.js) whenever a
// synchronous throw or a next(err) call happens anywhere earlier in the chain.
const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
};

module.exports = errorHandler;
