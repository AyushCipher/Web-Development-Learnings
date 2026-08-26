const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a new book with all fields
async function createBook(data) {
  try {
    const book = await prisma.book.create({
      data: {
        title: data.title,
        description: data.description,
        isbn: data.isbn,
        publishedDate: new Date(data.publishedDate),
        pages: data.pages,
        price: data.price,
        stock: data.stock || 1,
        author: { connect: { id: data.authorId } },
        publisher: { connect: { id: data.publisherId } },
        ...(data.genreIds && {
          genres: { connect: data.genreIds.map((id) => ({ id })) },
        }),
      },
      include: {
        author: true,
        publisher: true,
        genres: true,
        reviews: true,
      },
    });

    return book;
  } catch (e) {
    throw new Error(`Error creating book: ${e.message}`);
  }
}

// Get all books with pagination and filtering
async function getAllBooks(page = 1, limit = 10, filters = {}) {
  try {
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where = {};
    if (filters.authorId) where.authorId = filters.authorId;
    if (filters.publisherId) where.publisherId = filters.publisherId;
    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = parseFloat(filters.minPrice);
      if (filters.maxPrice) where.price.lte = parseFloat(filters.maxPrice);
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: true,
          publisher: true,
          genres: true,
          reviews: true,
        },
        orderBy: filters.sortBy || { createdAt: "desc" },
      }),
      prisma.book.count({ where }),
    ]);

    return {
      data: books,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (e) {
    throw new Error(`Error fetching books: ${e.message}`);
  }
}

// Get book by ID with all relations
async function getBookById(id) {
  try {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        author: true,
        publisher: true,
        genres: true,
        reviews: { include: { member: true } },
        borrowRecords: {
          where: { returnedDate: null },
          include: { member: true },
        },
      },
    });

    if (!book) {
      throw new Error(`Book with id ${id} not found`);
    }

    return book;
  } catch (e) {
    throw new Error(e.message);
  }
}

// Update book using transaction
async function updateBook(id, data) {
  try {
    const updatedBook = await prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({ where: { id } });
      if (!book) {
        throw new Error(`Book with id ${id} not found`);
      }

      // Prepare update data
      const updateData = {
        title: data.title,
        description: data.description,
        isbn: data.isbn,
        publishedDate: data.publishedDate
          ? new Date(data.publishedDate)
          : undefined,
        pages: data.pages,
        price: data.price,
        stock: data.stock,
      };

      // Remove undefined values
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key]
      );

      // Handle genre updates
      if (data.genreIds) {
        updateData.genres = {
          set: data.genreIds.map((id) => ({ id })),
        };
      }

      // Handle author/publisher updates
      if (data.authorId) {
        updateData.author = { connect: { id: data.authorId } };
      }
      if (data.publisherId) {
        updateData.publisher = { connect: { id: data.publisherId } };
      }

      return tx.book.update({
        where: { id },
        data: updateData,
        include: {
          author: true,
          publisher: true,
          genres: true,
        },
      });
    });

    return updatedBook;
  } catch (e) {
    throw new Error(`Error updating book: ${e.message}`);
  }
}

// Delete book by ID
async function deleteBook(id) {
  try {
    const deletedBook = await prisma.book.delete({
      where: { id },
      include: {
        author: true,
        publisher: true,
        genres: true,
      },
    });

    return deletedBook;
  } catch (e) {
    throw new Error(`Error deleting book: ${e.message}`);
  }
}

// Search books by title or ISBN
async function searchBooks(query, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { isbn: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        skip,
        take: limit,
        include: {
          author: true,
          publisher: true,
          genres: true,
          reviews: true,
        },
      }),
      prisma.book.count({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { isbn: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
      }),
    ]);

    return {
      data: books,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (e) {
    throw new Error(`Error searching books: ${e.message}`);
  }
}

// Get books by author
async function getBooksByAuthor(authorId, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: { authorId },
        skip,
        take: limit,
        include: {
          author: true,
          publisher: true,
          genres: true,
          reviews: true,
        },
      }),
      prisma.book.count({ where: { authorId } }),
    ]);

    return {
      data: books,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (e) {
    throw new Error(`Error fetching author books: ${e.message}`);
  }
}

// Get books by publisher
async function getBooksByPublisher(publisherId, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: { publisherId },
        skip,
        take: limit,
        include: {
          author: true,
          publisher: true,
          genres: true,
          reviews: true,
        },
      }),
      prisma.book.count({ where: { publisherId } }),
    ]);

    return {
      data: books,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (e) {
    throw new Error(`Error fetching publisher books: ${e.message}`);
  }
}

// Get available books (with stock > 0)
async function getAvailableBooks(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: { stock: { gt: 0 } },
        skip,
        take: limit,
        include: {
          author: true,
          publisher: true,
          genres: true,
          reviews: true,
        },
      }),
      prisma.book.count({ where: { stock: { gt: 0 } } }),
    ]);

    return {
      data: books,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (e) {
    throw new Error(`Error fetching available books: ${e.message}`);
  }
}

// Get books by price range
async function getBooksByPriceRange(minPrice, maxPrice, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: {
          price: {
            gte: parseFloat(minPrice),
            lte: parseFloat(maxPrice),
          },
        },
        skip,
        take: limit,
        include: {
          author: true,
          publisher: true,
          genres: true,
          reviews: true,
        },
      }),
      prisma.book.count({
        where: {
          price: {
            gte: parseFloat(minPrice),
            lte: parseFloat(maxPrice),
          },
        },
      }),
    ]);

    return {
      data: books,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (e) {
    throw new Error(`Error fetching books by price: ${e.message}`);
  }
}

// Add genres to a book
async function addGenresToBook(bookId, genreIds) {
  try {
    const book = await prisma.book.update({
      where: { id: bookId },
      data: {
        genres: {
          connect: genreIds.map((id) => ({ id })),
        },
      },
      include: {
        author: true,
        publisher: true,
        genres: true,
      },
    });

    return book;
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
