// Q. WHAT ARE ROUTES IN EXPRESS?
// ANS: Routes define the API endpoints of the backend application and determine how the server responds to client requests for specific URLs and HTTP methods. 
// Routes act like traffic managers that decide which functionality should execute when a request arrives. For example, routes determine what should happen when a user visits /login, /users, or /products. 
// In Express.js, routes are usually organized separately to keep the backend modular and clean.

// Example:

// router.get("/users", getUsers);
// router.post("/login", loginUser);

// Here:
// * /users route fetches users
// * /login route handles login requests



const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Post Routes:-


// GET Routes
// 1. Get all posts with authors (.populate)
router.get('/all', postController.getAllPostsWithAuthors);

// 2. Get all posts with detailed view (.populate with options)
router.get('/detailed/all', postController.getAllPostsDetailedView);

// 3. Get single post by ID (.findById)
router.get('/:id', postController.getPostById);

// 4. Get paginated posts (.skip, .limit, .sort, .select, .populate)
router.get('/paginated/all', postController.getPaginatedPosts);


// CREATE Routes
// 5. Create post
router.post('/create', postController.createPost);


// UPDATE Routes:
// 6. Update post by ID (.findByIdAndUpdate)
router.put('/update/:id', postController.updatePost);

// 7. Publish multiple posts by author (.updateMany)
router.put('/publish/by-author/:authorId', postController.publishPostsByAuthor);



// DELETE Routes:
// 8. Delete post by ID (.findByIdAndDelete)
router.delete('/delete/:id', postController.deletePost);

// 9. Delete old unpublished posts (.deleteMany)
router.delete('/delete-old/unpublished', postController.deleteOldUnpublishedPosts);

module.exports = router;
