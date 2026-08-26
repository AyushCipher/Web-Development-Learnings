// Standalone demo (run with `npm run routes-example`) - all 5 files in this
// folder hardcode port 3000, so only run one at a time.
const express = require("express");
const app = express();

//root route
app.get("/", (req, res) => {
  res.send("Welcome to our home page");
});

//get all products
app.get("/products", (req, res) => {
  const products = [
    {
      id: 1,
      label: "Product 1",
    },
    {
      id: 2,
      label: "Product 2",
    },
    {
      id: 3,
      label: "Product 3",
    },
  ];

  res.json(products);
});

// ROUTE PARAMETERS: the `:productId` segment is a placeholder - Express
// matches ANY value in that position (e.g. /products/2, /products/abc) and
// makes it available on req.params.productId as a STRING (hence the
// parseInt below - route params are never auto-converted to numbers).
app.get("/products/:productId", (req, res) => {
  console.log("req.params", req.params);

  const productId = parseInt(req.params.productId);
  const products = [
    {
      id: 1,
      label: "Product 1",
    },
    {
      id: 2,
      label: "Product 2",
    },
    {
      id: 3,
      label: "Product 3",
    },
  ];

  const getSingleProduct = products.find((product) => product.id === productId);

  if (getSingleProduct) {
    res.json(getSingleProduct);
  } else {
    res.status(404).send("Product is not found! Please try with a different ID.");
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is now running at port ${port}`);
});
