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
const userController = require('../controllers/userController');

// User Routes:-

// GET Routes:
// 1. Get all users (.find)
router.get('/all', userController.getAllUsers);

// 2. Get user by email (.findOne)
router.get('/email/:email', userController.getUserByEmail);

// 3. Get user by ID (.findById)
router.get('/:id', userController.getUserById);

// 4. Get users with selected fields (.select)
router.get('/selected/fields', userController.getUsersWithSelectedFields);

// 5. Get paginated users (.skip, .limit, .countDocuments)
router.get('/pagination/all', userController.getPaginatedUsers);

// 6. Get sorted users (.sort)
router.get('/sorted/recent', userController.getSortedUsers);

// 7. Get user with posts (.populate)
router.get('/with-posts/:id', userController.getUserWithPosts);

// 8. Get users fast (.lean)
router.get('/fast/all', userController.getFastUsers);

// 9. Get filtered and paginated users (combined)
router.get('/filter/combined', userController.getFilteredAndPaginatedUsers);

// 10. Count users (.countDocuments)
router.get('/count/total', userController.countUsers);


// CREATE Routes:
// 11. Create user using .create()
router.post('/create', userController.createUser);

// 12. Create user using .save()
router.post('/create-with-save', userController.createUserWithSave);


// UPDATE Routes:
// 13. Update user by email (.findOneAndUpdate)
router.put('/update-email/:email', userController.updateUserByEmail);

// 14. Update user by ID (.findByIdAndUpdate)
router.put('/update/:id', userController.updateUserById);

// 15. Update multiple users (.updateMany)
router.put('/update-many/active-status', userController.updateManyUsers);


// DELETE Routes:
// 16. Delete user by email (.findOneAndDelete)
router.delete('/delete-email/:email', userController.deleteUserByEmail);

// 17. Delete user by ID (.findByIdAndDelete)
router.delete('/delete/:id', userController.deleteUserById);

// 18. Delete inactive users (.deleteMany)
router.delete('/delete-many/inactive', userController.deleteInactiveUsers);

module.exports = router;
