const express = require("express");
const bookController = require("../controllers/bookController");

const router = express.Router();

router.post("/", bookController.createBook);
router.get("/search", bookController.searchBooks);
router.get("/available", bookController.getAvailableBooks);
router.get("/author/:authorId", bookController.getBooksByAuthor);
router.get("/publisher/:publisherId", bookController.getBooksByPublisher);
router.get("/price/:minPrice/:maxPrice", bookController.getBooksByPriceRange);
router.get("/", bookController.getAllBooks);
router.get("/:id", bookController.getBookById);
router.put("/:id", bookController.updateBook);
router.put("/:id/genres", bookController.addGenresToBook);
router.delete("/:id", bookController.deleteBook);

module.exports = router;
