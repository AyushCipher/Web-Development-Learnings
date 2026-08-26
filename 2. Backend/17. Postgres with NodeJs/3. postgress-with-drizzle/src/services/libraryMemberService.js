const { eq, or, ilike, desc, count } = require("drizzle-orm");
const { db } = require("../db");
const { libraryMembers } = require("../db/schema");

// Create a new library member
async function createMember(data) {
  try {
    const [member] = await db
      .insert(libraryMembers)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      })
      .returning();
    return member;
  } catch (error) {
    throw new Error(`Error creating member: ${error.message}`);
  }
}

// Get all members with pagination
async function getAllMembers(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [members, [{ total }]] = await Promise.all([
      db.query.libraryMembers.findMany({
        limit,
        offset: skip,
        with: {
          borrowRecords: { with: { book: true } },
          reviews: { with: { book: true } },
        },
        orderBy: desc(libraryMembers.membershipDate),
      }),
      db.select({ total: count() }).from(libraryMembers),
    ]);

    return { data: members, total, page, pages: Math.ceil(total / limit) };
  } catch (error) {
    throw new Error(`Error fetching members: ${error.message}`);
  }
}

// Get member by ID
async function getMemberById(id) {
  try {
    const member = await db.query.libraryMembers.findFirst({
      where: eq(libraryMembers.id, id),
      with: {
        borrowRecords: { with: { book: { with: { author: true } } } },
        reviews: { with: { book: true } },
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
    const updateData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      isActive: data.isActive !== undefined ? data.isActive : undefined,
    };
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const [member] = await db
      .update(libraryMembers)
      .set(updateData)
      .where(eq(libraryMembers.id, id))
      .returning();

    if (!member) {
      throw new Error(`Member with id ${id} not found`);
    }

    return member;
  } catch (error) {
    throw new Error(`Error updating member: ${error.message}`);
  }
}

// Delete member (soft delete by deactivating - same as the Prisma version)
async function deleteMember(id) {
  try {
    const [member] = await db
      .update(libraryMembers)
      .set({ isActive: false })
      .where(eq(libraryMembers.id, id))
      .returning();

    if (!member) {
      throw new Error(`Member with id ${id} not found`);
    }

    return member;
  } catch (error) {
    throw new Error(`Error deleting member: ${error.message}`);
  }
}

// Get active members
async function getActiveMembers(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const where = eq(libraryMembers.isActive, true);
    const [members, [{ total }]] = await Promise.all([
      db.query.libraryMembers.findMany({
        where,
        limit,
        offset: skip,
        with: { borrowRecords: true, reviews: true },
      }),
      db.select({ total: count() }).from(libraryMembers).where(where),
    ]);

    return { data: members, total, page, pages: Math.ceil(total / limit) };
  } catch (error) {
    throw new Error(`Error fetching active members: ${error.message}`);
  }
}

// Search members by name or email
async function searchMembers(query, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const where = or(
      ilike(libraryMembers.name, `%${query}%`),
      ilike(libraryMembers.email, `%${query}%`)
    );

    const [members, [{ total }]] = await Promise.all([
      db.query.libraryMembers.findMany({
        where,
        limit,
        offset: skip,
        with: { borrowRecords: true, reviews: true },
      }),
      db.select({ total: count() }).from(libraryMembers).where(where),
    ]);

    return { data: members, total, page, pages: Math.ceil(total / limit) };
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
