// Custom error class for Centralized Error Handling:

// Q. WHAT IS CENTRALIZED ERROR HANDLING?
// ANS: Centralized Error Handling is a technique where all errors in the application are handled at a single place instead of handling them individually inside every route or controller. 
// Rather than writing separate try-catch blocks and custom error responses throughout the application, all errors are forwarded to a global error middleware that decides how to log the error and what response should be sent to the client.


// Q. WHY IS CENTRALIZED ERROR HANDLING REQUIRED? 
// ANS: Without centralized error handling, every route needs separate try-catch which creates repeated code, messy backend, inconsistent responses.
// Centralized Error Handling solves all of these by keeping error logic in one place.

// Q. How Does It Work?
// ANS: Workflow:
// Client Request
//       ↓
// Route Handler
//       ↓
// Error Occurs
//       ↓
// asyncHandler catches error
//       ↓
// next(error)
//       ↓
// globalErrorHandler
//       ↓
// Error Response Sent

// Instead of handling errors inside routes, routes simply throw errors and let the global error handler process them.


// IMPORTANT: 
// APIError Class is required since in normal JavaScript Error like:

// throw new Error("User not found");

// contains:
// {
//   message: "User not found"
// }

// but it does not contain HTTP Status Code and Error Type

// So we create: throw new APIError("User not found", 404);
// Now the error contains:

// {
//   message: "User not found",
//   statusCode: 404
// }

// This allows the global error handler to return proper HTTP responses.
class APIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = "APIError"; // set the error type to API Error
  }
}


// Automatically catches errors from async/await route handlers and passes them to the global error handler, eliminating the need for try-catch in every route
const asyncHandler = (fn) => (req, res, next) => {      
  Promise.resolve(fn(req, res, next)).catch(next);    
  // Runs route function inside Promise and if it throws an error, catch() will pass it to next() which triggers the global error handler.
};


const globalErrorhandler = (err, req, res, next) => {
  console.error(err.stack); // log the error stack

//  Stack Trace Example:- ( Useful for debugging )
//  Error:
//    at userController.js:15
//    at route.js:20


  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      status: "Error",
      message: err.message,
    });
  }

  // handle mongoose validation ->
  else if (err.name === "validationError") {
    return res.status(400).json({
      status: "error",
      message: "validation Error",
    });
  } else {
    return res.status(500).json({
      status: "error",
      message: "An unexpected error occured",
    });
  }
};

module.exports = { APIError, asyncHandler, globalErrorhandler };
