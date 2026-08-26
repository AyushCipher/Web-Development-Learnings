const { eq, and, or, ilike, gte, lte, desc, asc, count } = require("drizzle-orm");
const { db } = require("../db");
const { books, bookGenres } = require("../db/schema");
const { flattenBookGenres, flattenBookGenresList } = require("./helpers");

const BOOK_RELATIONS = {
  author: true,
  publisher: true,
  bookGenres: { with: { genre: true } },
  reviews: true,
};

// Create a new book with all fields
async function createBook(data) {
  try {
    const book = await db.transaction(async (tx) => {
      const [newBook] = await tx
        .insert(books)
        .values({
          title: data.title,
          description: data.description,
          isbn: data.isbn,
          publishedDate: new Date(data.publishedDate),
          pages: data.pages,
          price: data.price,
          stock: data.stock || 1,
          authorId: data.authorId,
          publisherId: data.publisherId,
        })
        .returning();

      if (data.genreIds && data.genreIds.length > 0) {
        await tx
          .insert(bookGenres)
          .values(data.genreIds.map((genreId) => ({ bookId: newBook.id, genreId })));
      }

      return tx.query.books.findFirst({
        where: eq(books.id, newBook.id),
        with: BOOK_RELATIONS,
      });
    });

    return flattenBookGenres(book);
  } catch (e) {
    throw new Error(`Error creating book: ${e.message}`);
  }
}

// Build a single WHERE condition from the same filter shape bookController
// forwards from req.query (see controllers/bookController.js#getAllBooks).
function buildBookFilters(filters) {
  const conditions = [];
  if (filters.authorId) conditions.push(eq(books.authorId, Number(filters.authorId)));
  if (filters.publisherId) conditions.push(eq(books.publisherId, Number(filters.publisherId)));
  if (filters.minPrice) conditions.push(gte(books.price, parseFloat(filters.minPrice)));
  if (filters.maxPrice) conditions.push(lte(books.price, parseFloat(filters.maxPrice)));
  if (filters.search) {
    conditions.push(
      or(
        ilike(books.title, `%${filters.search}%`),
        ilike(books.description, `%${filters.search}%`)
      )
    );
  }
  return conditions.length > 0 ? and(...conditions) : undefined;
}

// sortBy comes in as e.g. { title: "asc" } (a single-key object, same shape
// Prisma's `orderBy` accepts directly) - only a small allow-list of columns
// is honored so this can't be used to inject arbitrary SQL via the column name.
const SORTABLE_COLUMNS = { title: books.title, price: books.price, createdAt: books.createdAt, stock: books.stock };
function buildBookOrderBy(sortBy) {
  if (sortBy && typeof sortBy === "object") {
    const [column, direction] = Object.entries(sortBy)[0] || [];
    if (column && SORTABLE_COLUMNS[column]) {
      return direction === "asc" ? asc(SORTABLE_COLUMNS[column]) : desc(SORTABLE_COLUMNS[column]);
    }
  }
  return desc(books.createdAt);
}

// Get all books with pagination and filtering
async function getAllBooks(page = 1, limit = 10, filters = {}) {
  try {
    const skip = (page - 1) * limit;
    const where = buildBookFilters(filters);
    const orderBy = buildBookOrderBy(filters.sortBy);

    const [booksList, totalRows] = await Promise.all([
      db.query.books.findMany({
        where,
        limit,
        offset: skip,
        with: BOOK_RELATIONS,
        orderBy,
      }),
      db.select({ total: count() }).from(books).where(where),
    ]);

    return {
      data: flattenBookGenresList(booksList),
      total: totalRows[0].total,
      page,
      pages: Math.ceil(totalRows[0].total / limit),
    };
  } catch (e) {
    throw new Error(`Error fetching books: ${e.message}`);
  }
}

// Get book by ID with all relations
async function getBookById(id) {
  try {
    const book = await db.query.books.findFirst({
      where: eq(books.id, id),
      with: {
        author: true,
        publisher: true,
        bookGenres: { with: { genre: true } },
        reviews: { with: { member: true } },
        borrowRecords: {
          where: (borrowRecords, { isNull }) => isNull(borrowRecords.returnedDate),
          with: { member: true },
        },
      },
    });

    if (!book) {
      throw new Error(`Book with id ${id} not found`);
    }

    return flattenBookGenres(book);
  } catch (e) {
    throw new Error(e.message);
  }
}

// Update book using a transaction (mirrors the Prisma version's
// find-then-update-then-re-fetch-relations flow)
async function updateBook(id, data) {
  try {
    const updatedBook = await db.transaction(async (tx) => {
      const existing = await tx.query.books.findFirst({ where: eq(books.id, id) });
      if (!existing) {
        throw new Error(`Book with id ${id} not found`);
      }

      const updateData = {
        title: data.title,
        description: data.description,
        isbn: data.isbn,
        publishedDate: data.publishedDate ? new Date(data.publishedDate) : undefined,
        pages: data.pages,
        price: data.price,
        stock: data.stock,
        authorId: data.authorId,
        publisherId: data.publisherId,
      };
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key]
      );

      if (Object.keys(updateData).length > 0) {
        await tx.update(books).set(updateData).where(eq(books.id, id));
      }

      // `genreIds` behaves like Prisma's `genres: { set: [...] }` - it
      // REPLACES the book's full genre list, unlike addGenresToBook below
      // (which only adds to it).
      if (data.genreIds) {
        await tx.delete(bookGenres).where(eq(bookGenres.bookId, id));
        if (data.genreIds.length > 0) {
          await tx
            .insert(bookGenres)
            .values(data.genreIds.map((genreId) => ({ bookId: id, genreId })));
        }
      }

      return tx.query.books.findFirst({
        where: eq(books.id, id),
        with: { author: true, publisher: true, bookGenres: { with: { genre: true } } },
      });
    });

    return flattenBookGenres(updatedBook);
  } catch (e) {
    throw new Error(`Error updating book: ${e.message}`);
  }
}

// Delete book by ID
async function deleteBook(id) {
  try {
    const existing = await db.query.books.findFirst({
      where: eq(books.id, id),
      with: { author: true, publisher: true, bookGenres: { with: { genre: true } } },
    });

    if (!existing) {
      throw new Error(`Book with id ${id} not found`);
    }

    // FK `onDelete: "cascade"` on book_genres/reviews/borrow_records (see
    // db/schema.js) handles cleaning those up automatically.
    await db.delete(books).where(eq(books.id, id));

    return flattenBookGenres(existing);
  } catch (e) {
    throw new Error(`Error deleting book: ${e.message}`);
  }
}

// Search books by title or ISBN
async function searchBooks(query, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const where = or(
      ilike(books.title, `%${query}%`),
      ilike(books.isbn, `%${query}%`),
      ilike(books.description, `%${query}%`)
    );

    const [booksList, totalRows] = await Promise.all([
      db.query.books.findMany({ where, limit, offset: skip, with: BOOK_RELATIONS }),
      db.select({ total: count() }).from(books).where(where),
    ]);

    return {
      data: flattenBookGenresList(booksList),
      total: totalRows[0].total,
      page,
      pages: Math.ceil(totalRows[0].total / limit),
    };
  } catch (e) {
    throw new Error(`Error searching books: ${e.message}`);
  }
}

// Get books by author
async function getBooksByAuthor(authorId, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const where = eq(books.authorId, authorId);

    const [booksList, totalRows] = await Promise.all([
      db.query.books.findMany({ where, limit, offset: skip, with: BOOK_RELATIONS }),
      db.select({ total: count() }).from(books).where(where),
    ]);

    return {
      data: flattenBookGenresList(booksList),
      total: totalRows[0].total,
      page,
      pages: Math.ceil(totalRows[0].total / limit),
    };
  } catch (e) {
    throw new Error(`Error fetching author books: ${e.message}`);
  }
}

// Get books by publisher
async function getBooksByPublisher(publisherId, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const where = eq(books.publisherId, publisherId);

    const [booksList, totalRows] = await Promise.all([
      db.query.books.findMany({ where, limit, offset: skip, with: BOOK_RELATIONS }),
      db.select({ total: count() }).from(books).where(where),
    ]);

    return {
      data: flattenBookGenresList(booksList),
      total: totalRows[0].total,
      page,
      pages: Math.ceil(totalRows[0].total / limit),
    };
  } catch (e) {
    throw new Error(`Error fetching publisher books: ${e.message}`);
  }
}

// Get available books (with stock > 0)
async function getAvailableBooks(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const where = gte(books.stock, 1);

    const [booksList, totalRows] = await Promise.all([
      db.query.books.findMany({ where, limit, offset: skip, with: BOOK_RELATIONS }),
      db.select({ total: count() }).from(books).where(where),
    ]);

    return {
      data: flattenBookGenresList(booksList),
      total: totalRows[0].total,
      page,
      pages: Math.ceil(totalRows[0].total / limit),
    };
  } catch (e) {
    throw new Error(`Error fetching available books: ${e.message}`);
  }
}

// Get books by price range
async function getBooksByPriceRange(minPrice, maxPrice, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const where = and(
      gte(books.price, parseFloat(minPrice)),
      lte(books.price, parseFloat(maxPrice))
    );

    const [booksList, totalRows] = await Promise.all([
      db.query.books.findMany({ where, limit, offset: skip, with: BOOK_RELATIONS }),
      db.select({ total: count() }).from(books).where(where),
    ]);

    return {
      data: flattenBookGenresList(booksList),
      total: totalRows[0].total,
      page,
      pages: Math.ceil(totalRows[0].total / limit),
    };
  } catch (e) {
    throw new Error(`Error fetching books by price: ${e.message}`);
  }
}

// Add genres to a book (ADDS to the existing set - see updateBook's
// `genreIds` handling above for the "replace" behavior instead)
async function addGenresToBook(bookId, genreIds) {
  try {
    if (genreIds.length > 0) {
      await db
        .insert(bookGenres)
        .values(genreIds.map((genreId) => ({ bookId, genreId })))
        // A genre already attached to this book would otherwise violate the
        // (bookId, genreId) primary key - Prisma's `connect` is a no-op for
        // an already-connected row, so this matches that behavior instead
        // of erroring.
        .onConflictDoNothing();
    }

    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      with: { author: true, publisher: true, bookGenres: { with: { genre: true } } },
    });

    if (!book) {
      throw new Error(`Book with id ${bookId} not found`);
    }

    return flattenBookGenres(book);
  } catch (e) {
    throw new Error(`Error adding genres: ${e.message}`);
  }
}

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  searchBooks,
  getBooksByAuthor,
  getBooksByPublisher,
  getAvailableBooks,
  getBooksByPriceRange,
  addGenresToBook,
};
