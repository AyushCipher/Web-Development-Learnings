// Q. WHAT IS WINSTON?
// ANS: Winston is a production-grade logging library for Node.js applications used to record application events, errors, requests, warnings, and debugging information in a structured and manageable way. 
// Instead of relying on simple console.log() statements, Winston provides multiple log levels, file logging, timestamps, error stack traces, log rotation, and support for storing logs in various destinations such as 
// console, files, databases, or monitoring services.


// Q. WHY USE WINSTON FOR LOGGING IN A NODE.JS APPLICATION?
// ANS: Winston is used in Node.js applications for advanced and structured logging capabilities that go beyond simple console output.
// During development:

// console.log("User logged in");
// console.error(error);                ---> works fine.


// But in production:
// * Thousands of users
// * Millions of requests
// * Multiple servers

// You need:
// * Error tracking
// * Request logging
// * Audit logs
// * Log files
// * Searchable logs
// * Structured logs

// That's where Winston comes in.



// Q. Problem with console.log()?
// ANS: Suppose your server crashes at 3:17 AM and a customer reports: Payment failed

// With only console.log:
// * Logs disappear after restart
// * No timestamps
// * No error categorization
// * No file storage

// It becomes hard to debug.


// Winston Solution:
// Winston can automatically create:

// * error.log
// * combined.log
// * warnings.log
// * exceptions.log

// and store logs permanently.

// Example:
// [2026-05-30 11:15:42]
// [error]
// Database connection failed


const winston = require("winston");
const path = require("path");

// Define log directory
const logDir = path.join(__dirname, "../logs");



// Console log format (colorized and human-readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp, service, ...meta }) => {
    let metaStr = "";
    if (Object.keys(meta).length > 0) {
      metaStr = JSON.stringify(meta);
    }
    return `[${timestamp}] [${level}] [${service}] ${message} ${metaStr}`;
  })
);



// File log format (JSON with timestamps and error stacks)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);



// Create Winston logger instance with transports and formats
const logger = winston.createLogger({
  // Log level based on environment
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  
  // Default metadata added to all logs
  defaultMeta: { service: "express-extended-api" },
  
  // Log format
  format: fileFormat,
  
  // Transport layers
  transports: [
    // Console transport (development friendly)
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
    }),
    
    // Error file (only errors)
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: fileFormat,
    }),
    
    // Combined file (all logs)
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: fileFormat,
    }),
    
    // Warning file (warn and above)
    new winston.transports.File({
      filename: path.join(logDir, "warnings.log"),
      level: "warn",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: fileFormat,
    }),
  ],
  
  // Handle exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "exceptions.log"),
      format: fileFormat,
    }),
  ],
  
  // Handle rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "rejections.log"),
      format: fileFormat,
    }),
  ],
});



// HTTP request logger middleware
logger.httpLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    };
    
    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error("Server Error", logData);
    } else if (res.statusCode >= 400) {
      logger.warn("Client Error", logData);
    } else {
      logger.info("Request", logData);
    }
  });
  
  next();
};

/**
 * Log levels in Winston:
 * 0 = error     (critical failures)
 * 1 = warn      (warnings, potential issues)
 * 2 = info      (general information)
 * 3 = http      (HTTP requests)
 * 4 = debug     (debugging information)
 * 5 = silly     (detailed debug info)
 */

module.exports = logger;
