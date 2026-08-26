const Author = require("../models/Author");
const Book = require("../models/Book");
const mongoose = require("mongoose");


// 1. BASIC CRUD WITH POPULATION
const createAuthor = async (req, res) => {
  try {
    const author = new Author(req.body);
    await author.save();

    res.status(201).json({
      success: true,
      data: author,
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error creating author",
    });
  }
};

const createBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();

    res.status(201).json({
      success: true,
      data: book,
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error creating book",
    });
  }
};



// 2. POPULATION - Fetching Referenced Documents
const getBookWithAuthor = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author");
    // Avoid extra query like: Author.findById(book.author)

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error fetching book",
    });
  }
};



// 3. MULTI-LEVEL POPULATION
const getAllBooksWithDetails = async (req, res) => {
  try {
    // Populate author details for all books, .select(): Only returns selected fields
    const books = await Book.find().populate("author").select("title author genre rating");

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });

  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error fetching books",
    });
  }
};



// 4. TRANSACTIONS - Multi-document ACID transactions
// NOTE: mongoose.startSession()-based transactions only work against a
// MongoDB REPLICA SET (even a single-node one) - a plain standalone mongod
// rejects them with "Transaction numbers are only allowed on a replica set
// member or mongos". MongoDB Atlas clusters are always replica sets under
// the hood, so this code works unmodified there; if MONGO_URI points at a
// bare local `mongod` (no --replSet), these two endpoints will fail with
// "Error borrowing/returning book" even though the code itself is correct.
const borrowBook = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookId, userId } = req.body;

    // Find and update book stock
    const book = await Book.findById(bookId).session(session);

    if (!book || book.stock <= 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Book not available",
      });
    }

    // Decrease book stock
    book.stock -= 1;
    await book.save({ session });

    // You can add borrowing record here (in a real app)
    // await BorrowRecord.create([{ bookId, userId }], { session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Book borrowed successfully",
      data: book,
    });

  } catch (e) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Error borrowing book",
    });
  } finally {
    session.endSession();
  }
};

const returnBook = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookId } = req.body;

    const book = await Book.findById(bookId).session(session);

    if (!book) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Increase book stock
    book.stock += 1;
    await book.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Book returned successfully",
      data: book,
    });
  } catch (e) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Error returning book",
    });
  } finally {
    session.endSession();
  }
};



// Aggregation = Advanced data processing pipeline used for Analytics, Reports, Calculations (avg, sum, count)
// 5. AGGREGATION WITH POPULATE
const getAuthorBooksStats = async (req, res) => {
  try {
    const stats = await Book.aggregate([
      {
        $group: {
          _id: "$author",
          totalBooks: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          totalStock: { $sum: "$stock" },
        },
      },
      {
        $lookup: {                                    // Joins author collection
          from: "authors",                            // collection name in MongoDB (lowercase plural)   
          localField: "_id",                          // field from current pipeline (author ID)   
          foreignField: "_id",                        // field in authors collection
          as: "authorDetails",                        // name of new field where result will be stored
        },
      },

      // RESULT:-
      // [
      //   {
      //     _id: "A1",
      //     totalBooks: 2,
      //     authorDetails: [
      //       {
      //         _id: "A1",
      //         name: "John Doe"
      //       }
      //     ]
      //   }
      // ]


      {
        $unwind: "$authorDetails",                    // Converts array → object
      },

      {
        $project: {                                   // Reshapes output
          _id: 0,
          authorName: "$authorDetails.name",
          totalBooks: 1,
          avgRating: { $round: ["$avgRating", 2] },
          totalStock: 1,
        },
      },
      
      {
        $sort: { totalBooks: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
    
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error fetching author stats",
    });
  }
};



// 6. TEXT SEARCH ON BOOKS
const searchBooks = async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const books = await Book.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .populate("author", "name email");

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error searching books",
    });
  }
};



// 7. PAGINATION WITH POPULATION
const getBooksWithPagination = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .populate("author")
      .skip(skip)
      .limit(limit)
      .sort({ publishYear: -1 });

    const totalBooks = await Book.countDocuments();
    const totalPages = Math.ceil(totalBooks / limit);

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        currentPage: page,
        totalPages,
        totalBooks,
        hasNextPage: page < totalPages,
      },
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error fetching books",
    });
  }
};



// 8. ADVANCED FILTERING
const getFilteredBooks = async (req, res) => {
  try {
    const { minPrice, maxPrice, genre, rating, authorName } = req.query;

    const filter = {};

    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Genre filter (array field)
    if (genre) {
      filter.genre = genre;
    }

    // Rating filter
    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    // Author filter - requires lookup
    let books = await Book.find(filter).populate("author");

    if (authorName) {
      books = books.filter((book) =>
        book.author.name.toLowerCase().includes(authorName.toLowerCase())
      );
    }

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error filtering books",
    });
  }
};



// 9. BULK OPERATIONS ON BOOKS
const bulkUpdateBooks = async (req, res) => {
  try {
    const bulkOps = [
      {
        updateMany: {
          filter: { stock: { $lt: 5 } },
          update: { $set: { stockWarning: true } },
        },
      },
      {
        updateMany: {
          filter: { rating: { $gte: 4.5 } },
          update: { $addToSet: { tags: "bestseller" } }, // Add tag if not exists
        },
      },
    ];

    const result = await Book.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: "Bulk operations completed",
      data: {
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount,
      },
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error in bulk operations",
    });
  }
};



// 10. UPSERT OPERATION
const upsertBook = async (req, res) => {
  try {
    const { isbn, title, author, price } = req.body;

    const result = await Book.findOneAndUpdate(
      { isbn: isbn },
      { $set: { title, author, price } },
      { upsert: true, new: true, runValidators: true }
    ).populate("author");

    res.status(200).json({
      success: true,
      message: result._id ? "Book updated" : "Book created",
      data: result,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error in upsert operation",
    });
  }
};



// 11. USING CUSTOM METHODS
const borrowBookViaMethod = async (req, res) => {
  try {
    const { bookId } = req.body;

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Use custom method from schema
    await book.borrowBook();

    res.status(200).json({
      success: true,
      message: "Book borrowed successfully",
      data: book,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message || "Error borrowing book",
    });
  }
};

const returnBookViaMethod = async (req, res) => {
  try {
    const { bookId } = req.body;

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    await book.returnBook();

    res.status(200).json({
      success: true,
      message: "Book returned successfully",
      data: book,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error returning book",
    });
  }
};



// 12. USING STATIC METHODS
const getAuthorBooks = async (req, res) => {
  try {
    const { authorId } = req.params;

    const books = await Book.findByAuthor(authorId).populate("author");

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error fetching books",
    });
  }
};

const getPopularBooks = async (req, res) => {
  try {
    const books = await Book.findPopularBooks().populate("author");

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error fetching popular books",
    });
  }
};



// 13. LEAN QUERIES FOR PERFORMANCE
const getFastBooks = async (req, res) => {
  try {
    // lean() is faster for read-only operations
    const books = await Book.find({ rating: { $gte: 4 } }).lean().limit(50);

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error fetching books",
    });
  }
};

module.exports = {
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
};
