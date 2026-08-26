// const express = require("express"); // require is used to import express
// const app = express();

// app.listen(3000, () => {
//     console.log("App is running successfully.")
// })


// Server instantiate/create
const express = require("express");
const app = express();

// Load config from env file
require("dotenv").config();
const PORT = process.env.PORT || 5000;

// Middlewares are functions that execute during the request-response lifecycle in a web application.

// Middleware to parse JSON request body :- It tells your Express app to automatically parse incoming requests with a JSON payload and make the parsed data available in req.body.
app.use(express.json());

// When a client (like Postman, a frontend app, or another API) sends JSON data in the body of a request, this middleware:
// * Reads the JSON payload from the request.
// * Parses it into a JavaScript object.
// * Attaches it to req.body so you can easily access it in your route handlers.

// Import routes for Todo API
const todoRoutes = require("./routes/todo");

// Mount the Todo API route with server
app.use("/api/v1", todoRoutes);

// Connection to the database
const dbConnect = require("./config/database");
dbConnect();

// Default Route
app.get("/", (req, res) => {
    res.send(`<h1>This is my Homepage</h1>`);
});

// Start server

// app.listen(PORT, () => {
//     console.log(`Server started successfully at ${PORT}`);
// });

app.listen(PORT, (err) => {
    if (err) {
        console.error("Port in use or error in starting the server");
        return;
    }
    console.log(`Server started successfully at ${PORT}`);
});



// # NODEMON:-

// Nodemon is a development tool for Node.js applications that automatically restarts the server whenever there are changes in the source code files. 
// It’s particularly useful during development because it eliminates the need to manually stop and restart the server every time you make changes to your code.



// # POSTMAN API:-

// Postman is a popular API development and testing tool used to send HTTP requests and analyze responses from a RESTful API or web service. 
// It simplifies the process of testing, developing, and debugging APIs.



// * KEY USECASES OF POSTMAN:

// 1. API Testing: Postman allows developers to test API endpoints by sending different types of HTTP requests (GET, POST, PUT, DELETE, etc.) 
// with various headers, parameters, and body data. It provides an easy-to-use interface for checking if the API is working as expected.

// 2. Request Automation: Postman allows users to automate tests for APIs by setting up tests that can be run after each request to check 
// if the response meets expectations (e.g., checking status codes, response times, or content).

// 3. Environment Management: Postman allows you to manage multiple environments (e.g., development, staging, production) 
// and configure environment variables, making it easy to switch between different setups while testing APIs.



// # MONGODB COMPASS:-

// MongoDB Compass is the official GUI (Graphical User Interface) for MongoDB, a NoSQL database. It provides a user-friendly interface 
// to interact with MongoDB databases, making it easier for developers and database administrators to manage and query MongoDB data.

// * Key Use Cases of MongoDB Compass:

// 1. Database Exploration: MongoDB Compass allows you to visually explore MongoDB collections, databases, and documents. 
// You can easily see the structure of your data, which is helpful for understanding and debugging issues.

// 2. Query Building: Compass provides a visual query builder to help you write MongoDB queries.

// 3. Schema Analysis: Compass provides an easy way to analyze the schema of your MongoDB collections. It shows you an overview of the structure, 
// such as the fields, types, and distribution of data within your collections.








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

