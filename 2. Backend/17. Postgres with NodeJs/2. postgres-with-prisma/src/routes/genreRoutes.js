const express = require("express");
const genreController = require("../controllers/genreController");

const router = express.Router();

router.post("/", genreController.createGenre);
router.get("/", genreController.getAllGenres);
router.get("/:id", genreController.getGenreById);
router.get("/:id/books", genreController.getBooksByGenre);
router.put("/:id", genreController.updateGenre);
router.delete("/:id", genreController.deleteGenre);

module.exports = router;
