const { AsyncLocalStorage } = require("async_hooks");
const crypto = require("crypto");

// Q. WHY ASYNCLOCALSTORAGE INSTEAD OF JUST PASSING requestId AS A FUNCTION
//    ARGUMENT EVERYWHERE?
// ANS: AsyncLocalStorage lets a value set once at the top of a request (here,
// a request ID) stay reachable from anywhere else that request's async code
// runs - controllers, DB calls, error handlers - without threading it through
// every function signature by hand. logger.js reads this same store to stamp
// every log line with the request that produced it, automatically, with zero
// changes needed at any individual logger.info(...) call site.
const asyncLocalStorage = new AsyncLocalStorage();

const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  asyncLocalStorage.run({ requestId }, next);
};

module.exports = { asyncLocalStorage, requestIdMiddleware };
