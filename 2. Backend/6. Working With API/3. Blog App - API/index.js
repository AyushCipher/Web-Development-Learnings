// Server instantiate/create
const express = require("express");
const app = express();

// Load config from env file
require("dotenv").config(); // env file k andr ka configuration load kr dega process obj pe
const PORT = process.env.PORT || 5000;

// Middlewares are functions that execute during the request-response lifecycle in a web application.
// It can be used to log information about the incoming requests and outgoing responses, used for error handeling, parsing request bodies such as JSON, XML,etc.
// and can be used for authenticating users if they are authorized to access certain resources and redirect them to login pages if necessary.

// Middleware to parse JSON request body
app.use(express.json());

// Import routes for Blog API
const blog = require("./routes/blog");

// Mount the Blog API route with server
app.use("/api/v1", blog);

// Connection to the database
const connectWithDb = require("./config/database");
connectWithDb();

// Default Route
app.get("/", (req, res) => {
    res.send(`<h1>This is my Homepage</h1>`);
});

// Start server
app.listen(PORT, (err) => {
    if (err) {
        console.error("Port in use or error in starting the server");
        return;
    }
    console.log(`Server started successfully at ${PORT}`);
});



// MVC stands for Model-View-Controller, a design pattern used in software development to separate an application into three interconnected components. This separation helps manage the complexity of large-scale software systems by organizing code logically.

// Components of MVC:
// Model:

// Represents the application's data and business logic.
// Handles data retrieval, storage, and processing.
// Is independent of the user interface.
// Example: A database or class containing user information like name, age, etc.
// View:

// Displays the data (from the Model) to the user.
// Handles the presentation layer of the application.
// Is concerned with what the user sees on the screen.
// Example: An HTML page, a React component, or a GUI in a desktop application.
// Controller:

// Acts as an intermediary between the Model and the View.
// Handles user input, processes it, and updates the Model and/or View accordingly.
// Example: A function that processes a button click to fetch user data from the Model and display it in the View.
// Why is MVC Needed?
// Separation of Concerns:

// Keeps the codebase organized by dividing responsibilities into three distinct areas (data, UI, and logic).
// Makes it easier to maintain and scale the application.
// Reusability:

// Models, Views, and Controllers can be reused across different parts of the application or even in other projects.
// Parallel Development:

// Different teams can work on Models, Views, and Controllers simultaneously without interfering with one another.
// Flexibility:

// You can change the UI (View) without altering the underlying logic (Model).
// You can modify the business logic (Model) without affecting how data is presented (View).
// Testability:

// Easier to test individual components (e.g., testing a Controller separately from the View).
// Example of MVC in Action:
// In a web application where a user views and updates their profile:

// Model:

// Contains user information like name, email, and password.
// Interacts with the database to retrieve or update user data.
// View:

// Displays the user profile on the web page.
// Provides a form for the user to edit their information.
// Controller:

// Handles user actions like form submission.
// Validates the input and updates the Model.
// Refreshes the View with the updated information.


