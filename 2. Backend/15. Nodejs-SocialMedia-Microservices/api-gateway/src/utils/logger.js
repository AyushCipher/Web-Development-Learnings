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
  defaultMeta: { service: "api-gateway" },
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
