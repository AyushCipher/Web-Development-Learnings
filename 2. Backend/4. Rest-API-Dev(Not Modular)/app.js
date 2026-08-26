// "NOT MODULAR": every route, and the in-memory `books` array standing in
// for a database, all live in this one file - contrast with the
// controller/service/route-per-file layout used elsewhere in this repo
// (e.g. "6. Working With API" or "17. Postgres with NodeJs/2. postgres-with-prisma").
// Fine for a small demo; a real app splits these apart so routes.js,
// controllers.js, and the data layer can each be tested/changed independently.
const express = require("express");
const app = express();

// express.json() parses a JSON request body into req.body - without it,
// req.body would be undefined and the PUT /update/:id handler below
// (which reads req.body.title) would break.
app.use(express.json());

// Stand-in "database": a plain in-memory array. Resets to these two books
// every time the server restarts, and (being a single JS array, not a real
// DB) wouldn't be shared across multiple server instances in production.
let books = [
  {
    id: "1",
    title: "Book 1",
  },
  {
    id: "2",
    title: "Book 2",
  },
];


// NOTE: strictly speaking, textbook REST convention (see the Q&A notes at
// the bottom of this file) would model these as GET/POST/PUT/DELETE all on
// the SAME path "/books" (and "/books/:id"), letting the HTTP method itself
// express the action - not separate "/get", "/add", "/update/:id" paths
// with verbs baked into the URL. Kept as-is here to match what this demo
// was originally built with; a "RESTful" version is a good exercise.

// intro route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to our bookstore API! Explore our collection of books and find your next great read.",
  });
});


// get all books
app.get("/get", (req, res) => {
  res.json(books);
});


// get a single book
app.get("/get/:id", (req, res) => {
  const book = books.find((item) => item.id === req.params.id);
  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({
      message: "Book not found! Please try with a different Book ID.",
    });
  }
});


// add a new book
app.post("/add", (req, res) => {
  const newBook = {
    id: Math.floor(Math.random() * 1000).toString(),
    title: `Book ${Math.floor(Math.random() * 1000)}`,
  };

  books.push(newBook);
  res.status(200).json({
    data: newBook,
    message: "New book is added successfully.",
  });
});


// update a book
app.put("/update/:id", (req, res) => {
  const findCurrentBook = books.find(
    (bookItem) => bookItem.id === req.params.id
  );
  if (findCurrentBook) {
    findCurrentBook.title = req.body.title || findCurrentBook.title;

    res.status(200).json({
      message: `Book with ID ${req.params.id} updated successfully.`,
      data: findCurrentBook,
    });
  } else {
    res.status(404).json({
      message: "Book not found",
    });
  }
});

// delete a book
app.delete("/delete/:id", (req, res) => {
  const findIndexOfCurrentBook = books.findIndex(
    (item) => item.id === req.params.id
  );
  if (findIndexOfCurrentBook !== -1) {
    const deletedBook = books.splice(findIndexOfCurrentBook, 1);
    res.status(200).json({
      message: "Book deleted successfully.",
      data: deletedBook[0],
    });
  } else {
    res.status(404).json({
      message: "Book not found",
    });
  }
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`);
});


// Q. WHAT IS API?
// ANS: API (Application Programming Interface) is a set of rules and protocols that allows different software applications to communicate and interact with each other.

// Q. WHAT IS REST API?
// ANS: REST API (Representational State Transfer Application Programming Interface) is a standard architectural style used for communication between client applications and servers over HTTP.
//  A REST API allows frontend applications, mobile apps, or other services to interact with backend resources such as users, products, orders, or databases using HTTP methods like GET, POST, PUT, and DELETE. 
// In REST APIs, everything is treated as a resource, and each resource is accessed through a unique URL called an endpoint. 
// REST APIs are lightweight, scalable, stateless, and commonly exchange data in JSON format, making them the most widely used API architecture in modern web development.

// Q. WHY USE REST API?
// ANS: REST APIs are needed because modern applications usually have separate frontend and backend systems that must communicate efficiently. 
// For example, a React frontend, mobile application, or another server needs a standardized way to send requests and receive data from the backend. 
// REST APIs provide this communication layer by exposing backend functionalities and database resources securely through endpoints. 
// They allow different systems built using different technologies to communicate easily, support scalability, enable reusable backend services, and help developers build decoupled architectures where frontend and backend can be developed independently.

// Q. WORKFLOW OF REST API?
// ANS: The workflow of a REST API begins when a client application sends an HTTP request to a specific API endpoint. 
// The request reaches the backend server, where routing and middleware process the request, validate data, authenticate users if needed, and execute business logic. 
// The backend then interacts with the database to fetch, insert, update, or delete data. After processing, the server sends an HTTP response back to the client, usually in JSON format, along with appropriate status codes like 200 (success), 404 (not found), or 500 (server error). 
// For example, when a frontend requests /api/books, the backend fetches book data from the database and returns it to the client as a JSON response.