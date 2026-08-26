const { eq, or, ilike, desc, sql, count } = require("drizzle-orm");
const { db } = require("../db");
const { authors, books } = require("../db/schema");
const { flattenBookGenresList } = require("./helpers");

// Create a new author
async function createAuthor(data) {
  try {
    const [author] = await db
      .insert(authors)
      .values({ name: data.name, email: data.email, bio: data.bio })
      .returning();

    return author;
  } catch (error) {
    throw new Error(`Error creating author: ${error.message}`);
  }
}

// Get all authors with pagination
async function getAllAuthors(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [authorsList, [{ total }]] = await Promise.all([
      db.query.authors.findMany({
        limit,
        offset: skip,
        with: { books: true },
        orderBy: desc(authors.createdAt),
      }),
      db.select({ total: count() }).from(authors),
    ]);

    return {
      data: authorsList,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Error fetching authors: ${error.message}`);
  }
}

// Get author by ID
async function getAuthorById(id) {
  try {
    const author = await db.query.authors.findFirst({
      where: eq(authors.id, id),
      with: {
        books: {
          with: {
            publisher: true,
            bookGenres: { with: { genre: true } },
            reviews: true,
          },
        },
      },
    });

    if (!author) {
      throw new Error(`Author with id ${id} not found`);
    }

    author.books = flattenBookGenresList(author.books);

    return author;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Update author
async function updateAuthor(id, data) {
  try {
    const [author] = await db
      .update(authors)
      .set({ name: data.name, email: data.email, bio: data.bio })
      .where(eq(authors.id, id))
      .returning();

    if (!author) {
      throw new Error(`Author with id ${id} not found`);
    }

    const withBooks = await db.query.books.findMany({
      where: eq(books.authorId, id),
    });

    return { ...author, books: withBooks };
  } catch (error) {
    throw new Error(`Error updating author: ${error.message}`);
  }
}

// Delete author (with cascade - see books.authorId's onDelete: "cascade" in schema.js)
async function deleteAuthor(id) {
  try {
    const authorBooks = await db.query.books.findMany({
      where: eq(books.authorId, id),
    });

    const [deletedAuthor] = await db
      .delete(authors)
      .where(eq(authors.id, id))
      .returning();

    if (!deletedAuthor) {
      throw new Error(`Author with id ${id} not found`);
    }

    return { ...deletedAuthor, books: authorBooks };
  } catch (error) {
    throw new Error(`Error deleting author: ${error.message}`);
  }
}

// Search authors by name or email
async function searchAuthors(query, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const searchCondition = or(
      ilike(authors.name, `%${query}%`),
      ilike(authors.email, `%${query}%`),
      ilike(authors.bio, `%${query}%`)
    );

    const [authorsList, [{ total }]] = await Promise.all([
      db.query.authors.findMany({
        where: searchCondition,
        limit,
        offset: skip,
        with: { books: true },
      }),
      db.select({ total: count() }).from(authors).where(searchCondition),
    ]);

    return {
      data: authorsList,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Error searching authors: ${error.message}`);
  }
}

// Get author by email
async function getAuthorByEmail(email) {
  try {
    const author = await db.query.authors.findFirst({
      where: eq(authors.email, email),
      with: { books: true },
    });

    if (!author) {
      throw new Error(`Author with email ${email} not found`);
    }

    return author;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get prolific authors (with most books) - Drizzle's relational query API
// has no equivalent of Prisma's `orderBy: { books: { _count: 'desc' } }`,
// so this drops to the plain query builder: join + GROUP BY + a raw
// COUNT(...) ordered descending.
async function getProlificAuthors(limit = 10) {
  try {
    const rows = await db
      .select({
        id: authors.id,
        name: authors.name,
        email: authors.email,
        bio: authors.bio,
        createdAt: authors.createdAt,
        updatedAt: authors.updatedAt,
        totalBooks: sql`count(${books.id})`.mapWith(Number),
      })
      .from(authors)
      .leftJoin(books, eq(books.authorId, authors.id))
      .groupBy(authors.id)
      .orderBy(desc(sql`count(${books.id})`))
      .limit(limit);

    return rows.map((author) => ({
      ...author,
      books: author.totalBooks, // For compatibility (matches the Prisma version's shape)
    }));
  } catch (error) {
    throw new Error(`Error fetching prolific authors: ${error.message}`);
  }
}

module.exports = {
  createAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
  searchAuthors,
  getAuthorByEmail,
  getProlificAuthors,
};
