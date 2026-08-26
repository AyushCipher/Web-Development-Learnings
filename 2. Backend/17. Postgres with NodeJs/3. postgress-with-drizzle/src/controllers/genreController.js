const genreService = require("../services/genreService");

// Create genre
exports.createGenre = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Genre name is required" });
    }

    const genre = await genreService.createGenre({ name, description });
    res.status(201).json(genre);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all genres
exports.getAllGenres = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await genreService.getAllGenres(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get genre by ID
exports.getGenreById = async (req, res) => {
  try {
    const genre = await genreService.getGenreById(parseInt(req.params.id));
    res.json(genre);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Update genre
exports.updateGenre = async (req, res) => {
  try {
    const { name, description } = req.body;

    const genre = await genreService.updateGenre(parseInt(req.params.id), {
      name,
      description,
    });

    res.json(genre);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete genre
exports.deleteGenre = async (req, res) => {
  try {
    await genreService.deleteGenre(parseInt(req.params.id));
    res.json({ message: `Genre deleted with id ${req.params.id}` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get books by genre
exports.getBooksByGenre = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await genreService.getBooksByGenre(
      parseInt(req.params.id),
      page,
      limit
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
