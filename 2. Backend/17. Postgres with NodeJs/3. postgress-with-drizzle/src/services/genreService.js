const { eq, asc, count } = require("drizzle-orm");
const { db } = require("../db");
const { genres, books, bookGenres } = require("../db/schema");
const { flattenBookGenresList } = require("./helpers");

// Create a new genre
async function createGenre(data) {
  try {
    const [genre] = await db
      .insert(genres)
      .values({ name: data.name, description: data.description })
      .returning();
    return genre;
  } catch (error) {
    throw new Error(`Error creating genre: ${error.message}`);
  }
}

// Get all genres with pagination
async function getAllGenres(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [genresList, [{ total }]] = await Promise.all([
      db.query.genres.findMany({
        limit,
        offset: skip,
        with: { bookGenres: { with: { book: true } } },
        orderBy: asc(genres.name),
      }),
      db.select({ total: count() }).from(genres),
    ]);

    // Prisma's `include: { books: true }` returns Book[] directly on a
    // Genre; flatten the join rows the same way books.genres gets flattened
    // the other direction (see helpers.js).
    const data = genresList.map(({ bookGenres: joinRows, ...genre }) => ({
      ...genre,
      books: joinRows.map((row) => row.book),
    }));

    return { data, total, page, pages: Math.ceil(total / limit) };
  } catch (error) {
    throw new Error(`Error fetching genres: ${error.message}`);
  }
}

// Get genre by ID
async function getGenreById(id) {
  try {
    const genre = await db.query.genres.findFirst({
      where: eq(genres.id, id),
      with: {
        bookGenres: {
          with: {
            book: {
              with: { author: true, publisher: true, reviews: true },
            },
          },
        },
      },
    });

    if (!genre) {
      throw new Error(`Genre with id ${id} not found`);
    }

    const { bookGenres: joinRows, ...rest } = genre;
    return { ...rest, books: joinRows.map((row) => row.book) };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Update genre
async function updateGenre(id, data) {
  try {
    const [genre] = await db
      .update(genres)
      .set({ name: data.name, description: data.description })
      .where(eq(genres.id, id))
      .returning();

    if (!genre) {
      throw new Error(`Genre with id ${id} not found`);
    }

    const joinRows = await db.query.bookGenres.findMany({
      where: eq(bookGenres.genreId, id),
      with: { book: true },
    });

    return { ...genre, books: joinRows.map((row) => row.book) };
  } catch (error) {
    throw new Error(`Error updating genre: ${error.message}`);
  }
}

// Delete genre
async function deleteGenre(id) {
  try {
    const joinRows = await db.query.bookGenres.findMany({
      where: eq(bookGenres.genreId, id),
      with: { book: true },
    });

    const [genre] = await db
      .delete(genres)
      .where(eq(genres.id, id))
      .returning();

    if (!genre) {
      throw new Error(`Genre with id ${id} not found`);
    }

    return { ...genre, books: joinRows.map((row) => row.book) };
  } catch (error) {
    throw new Error(`Error deleting genre: ${error.message}`);
  }
}

// Get books by genre
async function getBooksByGenre(genreId, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const where = eq(bookGenres.genreId, genreId);

    const [joinRows, [{ total }]] = await Promise.all([
      db.query.bookGenres.findMany({
        where,
        limit,
        offset: skip,
        with: {
          book: {
            with: {
              author: true,
              publisher: true,
              bookGenres: { with: { genre: true } },
              reviews: true,
            },
          },
        },
      }),
      db.select({ total: count() }).from(bookGenres).where(where),
    ]);

    return {
      data: flattenBookGenresList(joinRows.map((row) => row.book)),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Error fetching books: ${error.message}`);
  }
}

module.exports = {
  createGenre,
  getAllGenres,
  getGenreById,
  updateGenre,
  deleteGenre,
  getBooksByGenre,
};
