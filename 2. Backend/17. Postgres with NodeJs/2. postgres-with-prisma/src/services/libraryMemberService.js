const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a new library member
async function createMember(data) {
  try {
    const member = await prisma.libraryMember.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
    });
    return member;
  } catch (error) {
    throw new Error(`Error creating member: ${error.message}`);
  }
}

// Get all members with pagination
async function getAllMembers(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [members, total] = await Promise.all([
      prisma.libraryMember.findMany({
        skip,
        take: limit,
        include: {
          borrowRecords: {
            include: { book: true },
          },
          reviews: {
            include: { book: true },
          },
        },
        orderBy: { membershipDate: "desc" },
      }),
      prisma.libraryMember.count(),
    ]);

    return {
      data: members,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Error fetching members: ${error.message}`);
  }
}

// Get member by ID
async function getMemberById(id) {
  try {
    const member = await prisma.libraryMember.findUnique({
      where: { id },
      include: {
        borrowRecords: {
          include: { book: { include: { author: true } } },
        },
        reviews: {
          include: { book: true },
        },
      },
    });

    if (!member) {
      throw new Error(`Member with id ${id} not found`);
    }

    return member;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Update member
async function updateMember(id, data) {
  try {
    const member = await prisma.libraryMember.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
      },
    });

    return member;
  } catch (error) {
    throw new Error(`Error updating member: ${error.message}`);
  }
}

// Delete member
async function deleteMember(id) {
  try {
    // Soft delete by deactivating
    const member = await prisma.libraryMember.update({
      where: { id },
      data: { isActive: false },
    });

    return member;
  } catch (error) {
    throw new Error(`Error deleting member: ${error.message}`);
  }
}

// Get active members
async function getActiveMembers(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [members, total] = await Promise.all([
      prisma.libraryMember.findMany({
        where: { isActive: true },
        skip,
        take: limit,
        include: {
          borrowRecords: true,
          reviews: true,
        },
      }),
      prisma.libraryMember.count({ where: { isActive: true } }),
    ]);

    return {
      data: members,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Error fetching active members: ${error.message}`);
  }
}

// Search members by name or email
async function searchMembers(query, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [members, total] = await Promise.all([
      prisma.libraryMember.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        skip,
        take: limit,
        include: {
          borrowRecords: true,
          reviews: true,
        },
      }),
      prisma.libraryMember.count({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
      }),
    ]);

    return {
      data: members,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Error searching members: ${error.message}`);
  }
}

module.exports = {
  createMember,
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
  getActiveMembers,
  searchMembers,
};
