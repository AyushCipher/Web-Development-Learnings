// Standalone demo (run with `npm run middleware`) - all 5 files in this
// folder hardcode port 3000, so only run one at a time.
const express = require("express");
const app = express();

// define middleware function: This middleware runs before route handlers.
const myFirstMiddleware = (req, res, next) => {
  console.log("This first middleware will run on every request.");

  next();     // next() transfers control to next middleware or route. Without next() request gets stuck forever.
};


// Registering Middleware Globally:- Every request passes through this middleware first.
app.use(myFirstMiddleware);


app.get("/", (req, res) => {
  res.send("Home page");
});


// About Route:- Handles GET request on "/about"
app.get("/about", (req, res) => {
  res.send("About page");
});


app.listen(3000, () => {
  console.log(`Server is now running on port 3000`);
});


// Q.WHAT IS MIDDLEWARE?
// ANS: Middleware in Express.js is a function that executes between the incoming client request and the final server response. 
// It has access to the request object (req), response object (res), and the next() function, which passes control to the next middleware or route handler. 
// Middleware is used to process requests, modify request/response data, perform authentication, logging, validation, error handling, and many other operations before the request reaches the final route.


// Q. WHY USE MIDDLEWARE?
// ANS: Middleware is needed to avoid repeating common logic in every route and to process requests centrally before sending responses. 
// In real applications, many tasks such as authentication, logging, parsing JSON, validating users, checking tokens, handling errors, and enabling CORS need to run for multiple routes. 
// Instead of writing the same code again and again inside every route handler, middleware allows developers to write reusable processing logic once and apply it globally or selectively across routes.

// Q. HOW DOES MIDDLEWARE WORK?
// ANS: When a client sends a request to the server, Express checks the middleware stack in the order they are registered. Each middleware receives the request and response objects, 
// performs its task, and then either ends the response or calls next() to transfer control to the next middleware or route handler. 
// If next() is not called and no response is sent, the request gets stuck because Express does not know how to continue processing the request.