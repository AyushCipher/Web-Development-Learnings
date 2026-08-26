// Standalone demo (run with `npm run app-module`) - all 5 files in this
// folder hardcode port 3000, so only run one at a time.
const express = require("express");

const app = express();

// Application Level Settings:- Configures settings globally for Express app.
// (Nothing in this file actually calls res.render(), so this setting has no
// visible effect here - see "3. EJS-tutorial" for a working example of EJS
// view rendering.)
app.set("view engine", "ejs");


// View Engine Setting:- Tells Express to use EJS template engine for rendering dynamic frontend pages.

// routing
app.get("/", (req, res) => {
  res.send("home page");
});

app.post("/api/data", (req, res) => {
  res.json({
    message: "Data received successfully.",
    data: req.body,
  });
});


// ERROR-HANDLING MIDDLEWARE: Express recognizes this as an error handler
// specifically because it takes FOUR parameters (err, req, res, next) -
// three-parameter middleware is treated as regular request middleware, not
// an error handler. It must also be registered AFTER all routes/middleware
// it's meant to protect - Express only reaches it when something upstream
// calls next(err) or throws synchronously inside a route handler. Neither
// route above does that, so this never actually fires in this demo.
app.use((err, req, res, next) => {
  console.log(err.stack);           // Prints detailed error information.
  res.status(500).send("Something went wrong. Please try again later.");
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is now running at port ${port}`);
});
