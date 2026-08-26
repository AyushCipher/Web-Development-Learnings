const express = require("express");
const productController = require("../controllers/product.controller");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// Browsing (list/get) is public - only creating a product requires a
// logged-in session, so requireAuth only guards the POST below.
router.get("/", productController.listProducts);
router.get("/:id", productController.getProduct);
router.post("/", requireAuth, productController.createProduct);

module.exports = router;
