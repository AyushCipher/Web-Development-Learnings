const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a new author
async function createAuthor(data) {
  try {
    const author = await prisma.author.create({
      data: {
        name: data.name,
        email: data.email,
        bio: data.bio,
      },
    });

    return author;
  } catch (error) {
    throw new Error(`Error creating author: ${error.message}`);
  }
}

// Get all authors with pagination
async function getAllAuthors(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [authors, total] = await Promise.all([
      prisma.author.findMany({
        skip,
        take: limit,
        include: { books: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.author.count(),
    ]);

    return {
      data: authors,
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
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        books: {
          include: {
            publisher: true,
            genres: true,
            reviews: true,
          },
        },
      },
    });

    if (!author) {
      throw new Error(`Author with id ${id} not found`);
    }

    return author;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Update author
async function updateAuthor(id, data) {
  try {
    const author = await prisma.author.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        bio: data.bio,
      },
      include: { books: true },
    });

    return author;
  } catch (error) {
    throw new Error(`Error updating author: ${error.message}`);
  }
}

// Delete author (with cascade)
async function deleteAuthor(id) {
  try {
    const deletedAuthor = await prisma.author.delete({
      where: { id },
      include: { books: true },
    });

    return deletedAuthor;
  } catch (error) {
    throw new Error(`Error deleting author: ${error.message}`);
  }
}

// Search authors by name or email
async function searchAuthors(query, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [authors, total] = await Promise.all([
      prisma.author.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { bio: { contains: query, mode: "insensitive" } },
          ],
        },
        skip,
        take: limit,
        include: { books: true },
      }),
      prisma.author.count({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { bio: { contains: query, mode: "insensitive" } },
          ],
        },
      }),
    ]);

    return {
      data: authors,
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
    const author = await prisma.author.findUnique({
      where: { email },
      include: { books: true },
    });

    if (!author) {
      throw new Error(`Author with email ${email} not found`);
    }

    return author;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get prolific authors (with most books)
async function getProlificAuthors(limit = 10) {
  try {
    const authors = await prisma.author.findMany({
      include: {
        books: {
          select: { id: true },
        },
      },
      orderBy: {
        books: {
          _count: "desc",
        },
      },
      take: limit,
    });

    return authors.map((author) => ({
      ...author,
      totalBooks: author.books.length,
      books: author.books.length, // For compatibility
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
