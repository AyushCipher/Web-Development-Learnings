const borrowRecordService = require("../services/borrowRecordService");

// Borrow a book
exports.borrowBook = async (req, res) => {
  try {
    const { bookId, memberId } = req.body;

    if (!bookId || !memberId) {
      return res
        .status(400)
        .json({ error: "Book ID and Member ID are required" });
    }

    const borrowRecord = await borrowRecordService.borrowBook(bookId, memberId);
    res.status(201).json(borrowRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Return a book
exports.returnBook = async (req, res) => {
  try {
    const borrowRecord = await borrowRecordService.returnBook(
      parseInt(req.params.id)
    );
    res.json(borrowRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all borrow records
exports.getAllBorrowRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await borrowRecordService.getAllBorrowRecords(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get active borrow records (not returned)
exports.getActiveBorrowRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await borrowRecordService.getActiveBorrowRecords(
      page,
      limit
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get overdue books
exports.getOverdueBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await borrowRecordService.getOverdueBooks(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get member borrow history
exports.getMemberBorrowHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await borrowRecordService.getMemberBorrowHistory(
      parseInt(req.params.memberId),
      page,
      limit
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get book borrow history
exports.getBookBorrowHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await borrowRecordService.getBookBorrowHistory(
      parseInt(req.params.bookId),
      page,
      limit
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get borrow record by ID
exports.getBorrowRecordById = async (req, res) => {
  try {
    const record = await borrowRecordService.getBorrowRecordById(
      parseInt(req.params.id)
    );
    res.json(record);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Get library statistics
exports.getLibraryStatistics = async (req, res) => {
  try {
    const stats = await borrowRecordService.getLibraryStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
