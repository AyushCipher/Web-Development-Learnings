// EJS (Embedded JavaScript) is a TEMPLATE ENGINE: instead of returning a
// plain string with res.send(), res.render() below fills a .ejs file (in
// views/) with data and sends back the resulting HTML - this is
// server-side rendering, so the browser receives fully-formed HTML with no
// client-side templating step required.
const express = require("express");
const path = require("path");

const app = express();

//set the view engine as ejs
app.set("view engine", "ejs");

// Express defaults to looking for views in ./views relative to wherever the
// process was started from - path.join(__dirname, ...) pins it to this
// file's own directory instead, so `node index.js` works the same
// regardless of the current working directory it's launched from.
app.set("views", path.join(__dirname, "views"));

const products = [
  {
    id: 1,
    title: "Product 1",
  },
  {
    id: 2,
    title: "Product 2",
  },
  {
    id: 3,
    title: "Product 3",
  },
];

// res.render(viewName, data) looks up views/home.ejs, runs it with `data`'s
// keys available as local variables inside the template (so home.ejs can
// reference `title` and `products` directly - see <%= title %> and
// products.forEach(...) there), and sends the resulting HTML string.
app.get("/", (req, res) => {
  res.render("home", { title: "Home", products: products });
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About page" });
});

const port = 3000;

app.listen(port, () => {
  console.log("server is running");
});
