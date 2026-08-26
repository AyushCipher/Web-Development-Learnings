const express = require("express");
const router = express.Router();

// import controller
const {dummyLink, likePost, unlikePost} = require("../controllers/LikeController");
const {createComment} = require("../controllers/commentController");
const {createPost, getAllPosts} = require("../controllers/postController");


// Define/Mapping API routes
router.get("/dummyroute", dummyLink);
router.post("/comments/create", createComment);
router.post("/posts/create", createPost);
router.get("/posts", getAllPosts);
router.post("/likes/like", likePost);
router.post("/likes/unlike", unlikePost)


// export
module.exports = router;

// A route is a defined URL pattern that the server listens to, and when that pattern is matched in an incoming request, 
// the server performs a specific action or returns a particular response.



// In the context of backend development, a route is a defined URL pattern that the server listens to, and when that pattern is matched in an incoming request, the server performs a specific action or returns a particular response.
// Routes are used to handle requests for different resources or actions in a web application. They are commonly part of web frameworks (like Express in Node.js, Flask in Python, or Django in Python) and are associated with HTTP methods (GET, POST, PUT, DELETE, etc.).

// * Key Concepts of Routes in Backend:

// 1. URL Path: A route is often associated with a URL path that specifies the resource or action you want to access.
// Example: /users, /products, /orders/:id.


// 2. HTTP Methods: Routes are usually mapped to specific HTTP methods (also called HTTP verbs), which define the type of action to be performed on the resource.

// * GET: Fetch data from the server (e.g., a list of users).
// * POST: Submit data to the server (e.g., create a new user).
// * PUT/PATCH: Update existing data (e.g., update a user’s details).
// * DELETE: Delete data (e.g., delete a user).


// 3. Route Handlers: When a request matches a route, a route handler (also called a controller or callback function) is invoked to process the request and send a response.

// Example:

// app.get('/users', (req, res) => {
//   // Fetch and send the list of users
//   res.send('User List');
// });


// 4. Parameters and Query Strings: Routes can include dynamic parts like parameters (e.g., /users/:id) or query strings (e.g., /products?category=electronics). These allow you to pass data through the URL.

// Example:

// // Route with a parameter
// app.get('/users/:id', (req, res) => {
//   const userId = req.params.id; // Retrieve user ID from URL
//   res.send(`User details for ID: ${userId}`);
// });

// Example with query string:


// app.get('/products', (req, res) => {
//   const category = req.query.category; // Retrieve 'category' query parameter
//   res.send(`Products in category: ${category}`);
// });



// 5. Middleware: In backend frameworks, routes are often associated with middleware functions that handle preprocessing tasks, like authentication, logging, or data validation, before passing control to the route handler.

// Example:

// app.use('/admin', authenticateUser);  // Middleware for all routes under /admin

// app.get('/admin/dashboard', (req, res) => {
//   res.send('Admin Dashboard');
// });
