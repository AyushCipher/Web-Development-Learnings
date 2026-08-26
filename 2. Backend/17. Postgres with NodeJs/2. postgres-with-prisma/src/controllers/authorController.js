const authorService = require("../services/authorService");

// Create author
exports.createAuthor = async (req, res) => {
  try {
    const { name, email, bio } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Author name is required" });
    }

    const author = await authorService.createAuthor({ name, email, bio });
    res.status(201).json(author);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all authors
exports.getAllAuthors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await authorService.getAllAuthors(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get author by ID
exports.getAuthorById = async (req, res) => {
  try {
    const author = await authorService.getAuthorById(parseInt(req.params.id));
    res.json(author);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Update author
exports.updateAuthor = async (req, res) => {
  try {
    const { name, email, bio } = req.body;

    const author = await authorService.updateAuthor(parseInt(req.params.id), {
      name,
      email,
      bio,
    });

    res.json(author);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete author
exports.deleteAuthor = async (req, res) => {
  try {
    await authorService.deleteAuthor(parseInt(req.params.id));
    res.json({ message: `Author deleted with id ${req.params.id}` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Search authors
exports.searchAuthors = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const result = await authorService.searchAuthors(query, page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get prolific authors
exports.getProlificAuthors = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const authors = await authorService.getProlificAuthors(limit);
    res.json(authors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

