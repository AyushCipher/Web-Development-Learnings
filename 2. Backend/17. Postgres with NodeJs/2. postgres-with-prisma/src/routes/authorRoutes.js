const express = require("express");
const authorController = require("../controllers/authorController");

const router = express.Router();

router.post("/", authorController.createAuthor);
router.get("/prolific", authorController.getProlificAuthors);
router.get("/search", authorController.searchAuthors);
router.get("/", authorController.getAllAuthors);
router.get("/:id", authorController.getAuthorById);
router.put("/:id", authorController.updateAuthor);
router.delete("/:id", authorController.deleteAuthor);

module.exports = router;

