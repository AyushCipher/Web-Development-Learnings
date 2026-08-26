const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a new genre
async function createGenre(data) {
  try {
    const genre = await prisma.genre.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
    return genre;
  } catch (error) {
    throw new Error(`Error creating genre: ${error.message}`);
  }
}

// Get all genres with pagination
async function getAllGenres(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [genres, total] = await Promise.all([
      prisma.genre.findMany({
        skip,
        take: limit,
        include: { books: true },
        orderBy: { name: "asc" },
      }),
      prisma.genre.count(),
    ]);

    return {
      data: genres,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Error fetching genres: ${error.message}`);
  }
}

// Get genre by ID
async function getGenreById(id) {
  try {
    const genre = await prisma.genre.findUnique({
      where: { id },
      include: {
        books: {
          include: {
            author: true,
            publisher: true,
            reviews: true,
          },
        },
      },
    });

    if (!genre) {
      throw new Error(`Genre with id ${id} not found`);
    }

    return genre;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Update genre
async function updateGenre(id, data) {
  try {
    const genre = await prisma.genre.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
      include: { books: true },
    });

    return genre;
  } catch (error) {
    throw new Error(`Error updating genre: ${error.message}`);
  }
}

// Delete genre
async function deleteGenre(id) {
  try {
    const genre = await prisma.genre.delete({
      where: { id },
      include: { books: true },
    });

    return genre;
  } catch (error) {
    throw new Error(`Error deleting genre: ${error.message}`);
  }
}

// Get books by genre
async function getBooksByGenre(genreId, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: {
          genres: {
            some: { id: genreId },
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
          genres: {
            some: { id: genreId },
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
