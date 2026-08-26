const { eq, desc, count } = require("drizzle-orm");
const { db } = require("../db");
const { publishers, books } = require("../db/schema");
const { flattenBookGenresList } = require("./helpers");

// Create a new publisher
async function createPublisher(data) {
  try {
    const [publisher] = await db
      .insert(publishers)
      .values({ name: data.name, email: data.email, country: data.country })
      .returning();
    return publisher;
  } catch (error) {
    throw new Error(`Error creating publisher: ${error.message}`);
  }
}

// Get all publishers with pagination
async function getAllPublishers(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [publishersList, [{ total }]] = await Promise.all([
      db.query.publishers.findMany({
        limit,
        offset: skip,
        with: { books: true },
        orderBy: desc(publishers.createdAt),
      }),
      db.select({ total: count() }).from(publishers),
    ]);

    return {
      data: publishersList,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Error fetching publishers: ${error.message}`);
  }
}

// Get publisher by ID
async function getPublisherById(id) {
  try {
    const publisher = await db.query.publishers.findFirst({
      where: eq(publishers.id, id),
      with: {
        books: {
          with: { author: true, bookGenres: { with: { genre: true } } },
        },
      },
    });

    if (!publisher) {
      throw new Error(`Publisher with id ${id} not found`);
    }

    publisher.books = flattenBookGenresList(publisher.books);

    return publisher;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Update publisher
async function updatePublisher(id, data) {
  try {
    const [publisher] = await db
      .update(publishers)
      .set({ name: data.name, email: data.email, country: data.country })
      .where(eq(publishers.id, id))
      .returning();

    if (!publisher) {
      throw new Error(`Publisher with id ${id} not found`);
    }

    const withBooks = await db.query.books.findMany({
      where: eq(books.publisherId, id),
    });

    return { ...publisher, books: withBooks };
  } catch (error) {
    throw new Error(`Error updating publisher: ${error.message}`);
  }
}

// Delete publisher
async function deletePublisher(id) {
  try {
    const publisherBooks = await db.query.books.findMany({
      where: eq(books.publisherId, id),
    });

    const [publisher] = await db
      .delete(publishers)
      .where(eq(publishers.id, id))
      .returning();

    if (!publisher) {
      throw new Error(`Publisher with id ${id} not found`);
    }

    return { ...publisher, books: publisherBooks };
  } catch (error) {
    throw new Error(`Error deleting publisher: ${error.message}`);
  }
}

// Get publishers by country
async function getPublishersByCountry(country, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const where = eq(publishers.country, country);
    const [publishersList, [{ total }]] = await Promise.all([
      db.query.publishers.findMany({
        where,
        limit,
        offset: skip,
        with: { books: true },
      }),
      db.select({ total: count() }).from(publishers).where(where),
    ]);

    return {
      data: publishersList,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Error fetching publishers: ${error.message}`);
  }
}

module.exports = {
  createPublisher,
  getAllPublishers,
  getPublisherById,
  updatePublisher,
  deletePublisher,
  getPublishersByCountry,
};
