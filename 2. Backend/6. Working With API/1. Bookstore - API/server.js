// MVC layout: database/ (Model connection), models/ (schema), controllers/
// (business logic per route), routes/ (URL -> controller wiring). server.js
// just assembles these pieces - it has no business logic of its own.
require("dotenv").config();
const express = require("express");
const connectToDB = require("./database/db");
const bookRoutes = require("./routes/book-routes");

const app = express();
const PORT = process.env.PORT || 3000;

//connect to our database
connectToDB();

// Parses incoming JSON request bodies into req.body - required before any
// controller (e.g. addNewBook) can read req.body.
app.use(express.json());

// Every route in book-routes.js is mounted under /api/books, so
// router.get("/get", ...) there actually answers GET /api/books/get.
app.use("/api/books", bookRoutes);

app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`);
});
