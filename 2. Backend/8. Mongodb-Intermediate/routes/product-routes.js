const express = require("express");
const {
  insertSampleProducts,
  getProductStats,
  getProductAnalysis,
  getProductsWithPagination,
  searchProducts,
  getFilteredProducts,
  getFastProducts,
  getProductNameAndPrice,
  bulkUpdateProducts,
  upsertProduct,
  updateProductStock,
  explainQuery,
  getDistinctCategories,
  getProductsByCategory,
  getExpensiveProducts,
  getInStockProducts,
} = require("../controllers/product-controller");

const router = express.Router();

// Basic operations
router.post("/add", insertSampleProducts);

// Analytics & Aggregation
router.get("/stats", getProductStats);
router.get("/analysis", getProductAnalysis);

// Pagination & Sorting
router.get("/paginated", getProductsWithPagination);

// Search
router.get("/search", searchProducts);

// Filtering
router.get("/filter", getFilteredProducts);

// Performance optimized queries
router.get("/fast", getFastProducts);
router.get("/select", getProductNameAndPrice);

// Bulk operations
router.post("/bulk-update", bulkUpdateProducts);

// Upsert
router.post("/upsert", upsertProduct);

// Update stock
router.patch("/:productId/stock", updateProductStock);

// Query analysis
router.get("/explain", explainQuery);

// Distinct values
router.get("/categories/distinct", getDistinctCategories);

// Static methods
router.get("/category/:category", getProductsByCategory);
router.get("/expensive", getExpensiveProducts);
router.get("/in-stock", getInStockProducts);

module.exports = router;
