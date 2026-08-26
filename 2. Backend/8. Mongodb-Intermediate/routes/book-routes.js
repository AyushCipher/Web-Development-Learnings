const express = require("express");
const {
  createAuthor,
  createBook,
  getBookWithAuthor,
  getAllBooksWithDetails,
  borrowBook,
  returnBook,
  getAuthorBooksStats,
  searchBooks,
  getBooksWithPagination,
  getFilteredBooks,
  bulkUpdateBooks,
  upsertBook,
  borrowBookViaMethod,
  returnBookViaMethod,
  getAuthorBooks,
  getPopularBooks,
  getFastBooks,
} = require("../controllers/book-controller");

const router = express.Router();

// ===== AUTHOR ROUTES =====
router.post("/author", createAuthor);

// ===== BOOK CRUD =====
router.post("/book", createBook);

// ===== POPULATION & REFERENCES =====
router.get("/book/:id", getBookWithAuthor);
router.get("/all/with-details", getAllBooksWithDetails);

// ===== TRANSACTIONS =====
router.post("/borrow", borrowBook);
router.post("/return", returnBook);

// ===== AGGREGATION WITH LOOKUP =====
router.get("/stats/author-books", getAuthorBooksStats);

// ===== SEARCH =====
router.get("/search", searchBooks);

// ===== PAGINATION =====
router.get("/paginated", getBooksWithPagination);

// ===== FILTERING =====
router.get("/filter", getFilteredBooks);

// ===== BULK OPERATIONS =====
router.post("/bulk-update", bulkUpdateBooks);

// ===== UPSERT =====
router.post("/upsert", upsertBook);

// ===== CUSTOM METHODS =====
router.post("/borrow-method", borrowBookViaMethod);
router.post("/return-method", returnBookViaMethod);

// ===== STATIC METHODS =====
router.get("/author/:authorId/books", getAuthorBooks);
router.get("/popular", getPopularBooks);

// ===== PERFORMANCE OPTIMIZED =====
router.get("/fast/popular", getFastBooks);

module.exports = router;
