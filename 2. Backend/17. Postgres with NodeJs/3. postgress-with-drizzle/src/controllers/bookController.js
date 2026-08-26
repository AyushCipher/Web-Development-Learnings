const bookService = require("../services/bookService");

// Create book
exports.createBook = async (req, res) => {
  try {
    const {
      title,
      description,
      isbn,
      publishedDate,
      pages,
      price,
      stock,
      authorId,
      publisherId,
      genreIds,
    } = req.body;

    if (!title || !isbn || !authorId || !publisherId || !publishedDate) {
      return res.status(400).json({
        error:
          "Title, ISBN, Author ID, Publisher ID, and Published Date are required",
      });
    }

    const book = await bookService.createBook({
      title,
      description,
      isbn,
      publishedDate,
      pages,
      price,
      stock,
      authorId,
      publisherId,
      genreIds,
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      authorId: req.query.authorId,
      publisherId: req.query.publisherId,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      search: req.query.search,
      sortBy: req.query.sortBy,
    };

    const result = await bookService.getAllBooks(page, limit, filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await bookService.getBookById(parseInt(req.params.id));
    res.json(book);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Update book
exports.updateBook = async (req, res) => {
  try {
    const {
      title,
      description,
      isbn,
      publishedDate,
      pages,
      price,
      stock,
      authorId,
      publisherId,
      genreIds,
    } = req.body;

    const book = await bookService.updateBook(parseInt(req.params.id), {
      title,
      description,
      isbn,
      publishedDate,
      pages,
      price,
      stock,
      authorId,
      publisherId,
      genreIds,
    });

    res.json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete book
exports.deleteBook = async (req, res) => {
  try {
    await bookService.deleteBook(parseInt(req.params.id));
    res.json({ message: `Book deleted with id ${req.params.id}` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Search books
exports.searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const result = await bookService.searchBooks(query, page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get books by author
exports.getBooksByAuthor = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await bookService.getBooksByAuthor(
      parseInt(req.params.authorId),
      page,
      limit
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get books by publisher
exports.getBooksByPublisher = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await bookService.getBooksByPublisher(
      parseInt(req.params.publisherId),
      page,
      limit
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get available books
exports.getAvailableBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await bookService.getAvailableBooks(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get books by price range
exports.getBooksByPriceRange = async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await bookService.getBooksByPriceRange(
      minPrice,
      maxPrice,
      page,
      limit
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add genres to book
exports.addGenresToBook = async (req, res) => {
  try {
    const { genreIds } = req.body;

    if (!genreIds || !Array.isArray(genreIds)) {
      return res
        .status(400)
        .json({ error: "Genre IDs array is required" });
    }

    const book = await bookService.addGenresToBook(
      parseInt(req.params.id),
      genreIds
    );
    res.json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

