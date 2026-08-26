const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a new publisher
async function createPublisher(data) {
  try {
    const publisher = await prisma.publisher.create({
      data: {
        name: data.name,
        email: data.email,
        country: data.country,
      },
    });
    return publisher;
  } catch (error) {
    throw new Error(`Error creating publisher: ${error.message}`);
  }
}

// Get all publishers with pagination
async function getAllPublishers(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [publishers, total] = await Promise.all([
      prisma.publisher.findMany({
        skip,
        take: limit,
        include: { books: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.publisher.count(),
    ]);

    return {
      data: publishers,
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
    const publisher = await prisma.publisher.findUnique({
      where: { id },
      include: {
        books: {
          include: {
            author: true,
            genres: true,
          },
        },
      },
    });

    if (!publisher) {
      throw new Error(`Publisher with id ${id} not found`);
    }

    return publisher;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Update publisher
async function updatePublisher(id, data) {
  try {
    const publisher = await prisma.publisher.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        country: data.country,
      },
      include: { books: true },
    });

    return publisher;
  } catch (error) {
    throw new Error(`Error updating publisher: ${error.message}`);
  }
}

// Delete publisher
async function deletePublisher(id) {
  try {
    const publisher = await prisma.publisher.delete({
      where: { id },
      include: { books: true },
    });

    return publisher;
  } catch (error) {
    throw new Error(`Error deleting publisher: ${error.message}`);
  }
}

// Get publishers by country
async function getPublishersByCountry(country, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [publishers, total] = await Promise.all([
      prisma.publisher.findMany({
        where: { country },
        skip,
        take: limit,
        include: { books: true },
      }),
      prisma.publisher.count({ where: { country } }),
    ]);

    return {
      data: publishers,
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
