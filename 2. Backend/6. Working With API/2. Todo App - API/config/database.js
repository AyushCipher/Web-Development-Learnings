const mongoose = require("mongoose");

// Mongoose is an ODM (Object Data Modeling) library for MongoDB. It provides a schema-based solution for interacting with MongoDB.
// It has easy-to-use methods for database interactions and Middleware for handling pre- and post- database operation logic.
// Object Document Mapping (ODM) is a programming technique used to map objects in an application to documents in a NoSQL database like MongoDB.

require("dotenv").config(); // loads environment variables from a .env file into the process.env object.

const dbConnect = () => {
    mongoose.connect(process.env.DATABASE_URL, {
        // process object ma .env ka sara data directly feed nhi kr skte isliye 2nd line ka use kiye 
        // data feeding/fetching k liye... For loading data from child data to parent object
        
        useNewUrlParser: true, // Uses the new MongoDB driver's URL parser to ensure proper parsing of the database connection string.
        useUnifiedTopology: true, // Enables the new server discovery and monitoring engine in Mongoose and improves connection. 
    })
    .then(() => console.log("Successful connection to the database."))
    .catch((error) => {
        console.error("Issue in database connection.");
        console.error(error.message);
        process.exit(1); // Exit the process with failure code
    });
};

module.exports = dbConnect;