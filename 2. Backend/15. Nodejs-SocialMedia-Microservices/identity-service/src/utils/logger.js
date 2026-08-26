const winston = require("winston");
const { asyncLocalStorage } = require("./requestContext");

// Q. WHY DOES THIS FILE IMPORT requestContext.js?
// ANS: requestIdFormat pulls the current request's ID out of the
// AsyncLocalStorage store (see requestContext.js) and stamps it onto every
// log line's metadata automatically - so a request that touches multiple
// services can be traced end-to-end by grepping logs for one ID, without
// every controller having to remember to pass a request ID into every
// logger.info(...) call itself.
const requestIdFormat = winston.format((info) => {
  const store = asyncLocalStorage.getStore();
  if (store?.requestId) info.requestId = store.requestId;
  return info;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    requestIdFormat(),
    winston.format.json()
  ),
  defaultMeta: { service: "identity-service" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

module.exports = logger;

// Q. Why use winston for logging in a Node.js application?
// ANS: Winston is a popular logging library used in Node.js applications for advanced and structured logging. 
// It is used because simple console.log() statements are not sufficient for production-level applications where developers need organized logs, multiple log levels (info, error, warn, debug), log storage in files/databases, timestamps, colored logs, and centralized monitoring. 
// Winston helps developers track application behavior, debug errors, monitor server activity, and maintain logs efficiently in scalable applications. 
// It also supports logging to multiple transports such as console, files, MongoDB, or external monitoring services, making it very useful for production backend systems.