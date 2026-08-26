const { eq, and, isNull, lt, isNotNull, desc, asc, count, sum, sql } = require("drizzle-orm");
const { db } = require("../db");
const { borrowRecords, books, libraryMembers } = require("../db/schema");

const BORROWING_PERIOD_DAYS = 14; // 2 weeks
const FINE_PER_DAY = 10; // 10 currency units per day

// Create a borrow record (member borrows a book)
async function borrowBook(bookId, memberId) {
  try {
    const result = await db.transaction(async (tx) => {
      const book = await tx.query.books.findFirst({ where: eq(books.id, bookId) });
      if (!book) {
        throw new Error(`Book with id ${bookId} not found`);
      }
      if (book.stock <= 0) {
        throw new Error("Book is out of stock");
      }

      const member = await tx.query.libraryMembers.findFirst({
        where: eq(libraryMembers.id, memberId),
      });
      if (!member) {
        throw new Error(`Member with id ${memberId} not found`);
      }
      if (!member.isActive) {
        throw new Error("Member is not active");
      }

      const activeBorrow = await tx.query.borrowRecords.findFirst({
        where: and(
          eq(borrowRecords.bookId, bookId),
          eq(borrowRecords.memberId, memberId),
          isNull(borrowRecords.returnedDate)
        ),
      });
      if (activeBorrow) {
        throw new Error("Member already has this book borrowed");
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + BORROWING_PERIOD_DAYS);

      const [newRecord] = await tx
        .insert(borrowRecords)
        .values({ bookId, memberId, dueDate })
        .returning();

      await tx
        .update(books)
        .set({ stock: book.stock - 1 })
        .where(eq(books.id, bookId));

      return tx.query.borrowRecords.findFirst({
        where: eq(borrowRecords.id, newRecord.id),
        with: { book: { with: { author: true } }, member: true },
      });
    });

    return result;
  } catch (error) {
    throw new Error(`Error borrowing book: ${error.message}`);
  }
}

// Return a borrowed book
async function returnBook(borrowRecordId) {
  try {
    const result = await db.transaction(async (tx) => {
      const record = await tx.query.borrowRecords.findFirst({
        where: eq(borrowRecords.id, borrowRecordId),
        with: { book: true, member: true },
      });

      if (!record) {
        throw new Error(`Borrow record with id ${borrowRecordId} not found`);
      }
      if (record.returnedDate) {
        throw new Error("Book has already been returned");
      }

      const today = new Date();
      let fine = 0;
      if (today > record.dueDate) {
        const daysLate = Math.floor((today - record.dueDate) / (1000 * 60 * 60 * 24));
        fine = daysLate * FINE_PER_DAY;
      }

      await tx
        .update(borrowRecords)
        .set({ returnedDate: today, fine })
        .where(eq(borrowRecords.id, borrowRecordId));

      await tx
        .update(books)
        .set({ stock: record.book.stock + 1 })
        .where(eq(books.id, record.bookId));

      return tx.query.borrowRecords.findFirst({
        where: eq(borrowRecords.id, borrowRecordId),
        with: { book: { with: { author: true } }, member: true },
      });
    });

    return result;
  } catch (error) {
    throw new Error(`Error returning book: ${error.message}`);
  }
}

// Get all borrow records with pagination
async function getAllBorrowRecords(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [records, [{ total }]] = await Promise.all([
      db.query.borrowRecords.findMany({
        limit,
        offset: skip,
        with: { book: { with: { author: true } }, member: true },
        orderBy: desc(borrowRecords.borrowDate),
      }),
      db.select({ total: count() }).from(borrowRecords),
    ]);

    return { data: records, total, page, pages: Math.ceil(total / limit) };
  } catch (error) {
    throw new Error(`Error fetching borrow records: ${error.message}`);
  }
}

// Get active borrow records (not returned)
async function getActiveBorrowRecords(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const where = isNull(borrowRecords.returnedDate);
    const [records, [{ total }]] = await Promise.all([
      db.query.borrowRecords.findMany({
        where,
        limit,
        offset: skip,
        with: { book: { with: { author: true } }, member: true },
        orderBy: desc(borrowRecords.borrowDate),
      }),
      db.select({ total: count() }).from(borrowRecords).where(where),
    ]);

    return { data: records, total, page, pages: Math.ceil(total / limit) };
  } catch (error) {
    throw new Error(`Error fetching active borrow records: ${error.message}`);
  }
}

// Get overdue books
async function getOverdueBooks(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const where = and(isNull(borrowRecords.returnedDate), lt(borrowRecords.dueDate, new Date()));
    const [records, [{ total }]] = await Promise.all([
      db.query.borrowRecords.findMany({
        where,
        limit,
        offset: skip,
        with: { book: { with: { author: true } }, member: true },
        orderBy: asc(borrowRecords.dueDate),
      }),
      db.select({ total: count() }).from(borrowRecords).where(where),
    ]);

    return { data: records, total, page, pages: Math.ceil(total / limit) };
  } catch (error) {
    throw new Error(`Error fetching overdue books: ${error.message}`);
  }
}

// Get borrow history of a member
async function getMemberBorrowHistory(memberId, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const where = eq(borrowRecords.memberId, memberId);
    const [records, [{ total }]] = await Promise.all([
      db.query.borrowRecords.findMany({
        where,
        limit,
        offset: skip,
        with: { book: { with: { author: true } }, member: true },
        orderBy: desc(borrowRecords.borrowDate),
      }),
      db.select({ total: count() }).from(borrowRecords).where(where),
    ]);

    return { data: records, total, page, pages: Math.ceil(total / limit) };
  } catch (error) {
    throw new Error(`Error fetching member borrow history: ${error.message}`);
  }
}

// Get borrow history of a book
async function getBookBorrowHistory(bookId, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const where = eq(borrowRecords.bookId, bookId);
    const [records, [{ total }]] = await Promise.all([
      db.query.borrowRecords.findMany({
        where,
        limit,
        offset: skip,
        with: { member: true, book: true },
        orderBy: desc(borrowRecords.borrowDate),
      }),
      db.select({ total: count() }).from(borrowRecords).where(where),
    ]);

    return { data: records, total, page, pages: Math.ceil(total / limit) };
  } catch (error) {
    throw new Error(`Error fetching book borrow history: ${error.message}`);
  }
}

// Get borrow record by ID
async function getBorrowRecordById(id) {
  try {
    const record = await db.query.borrowRecords.findFirst({
      where: eq(borrowRecords.id, id),
      with: { book: { with: { author: true, publisher: true } }, member: true },
    });

    if (!record) {
      throw new Error(`Borrow record with id ${id} not found`);
    }

    return record;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get library statistics
async function getLibraryStatistics() {
  try {
    const stats = await db.transaction(async (tx) => {
      const [{ total: totalBorrows }] = await tx.select({ total: count() }).from(borrowRecords);

      const [{ total: activeBorrows }] = await tx
        .select({ total: count() })
        .from(borrowRecords)
        .where(isNull(borrowRecords.returnedDate));

      const [{ total: overdueBooks }] = await tx
        .select({ total: count() })
        .from(borrowRecords)
        .where(and(isNull(borrowRecords.returnedDate), lt(borrowRecords.dueDate, new Date())));

      const [{ totalFine }] = await tx
        .select({ totalFine: sum(borrowRecords.fine) })
        .from(borrowRecords)
        .where(isNotNull(borrowRecords.returnedDate));

      // Mirrors Prisma's groupBy({ by: ["bookId"], _count: { id: true },
      // orderBy: { _count: { id: "desc" } }, take: 5 }) shape exactly, so
      // callers of this API see the same `_count.id` field either way.
      const mostPopularBooks = await tx
        .select({ bookId: borrowRecords.bookId, borrowCount: sql`count(${borrowRecords.id})`.mapWith(Number) })
        .from(borrowRecords)
        .groupBy(borrowRecords.bookId)
        .orderBy(desc(sql`count(${borrowRecords.id})`))
        .limit(5);

      return {
        totalBorrows,
        activeBorrows,
        overdueBooks,
        totalFineCollected: totalFine ? Number(totalFine) : 0,
        mostPopularBooks: mostPopularBooks.map((row) => ({
          bookId: row.bookId,
          _count: { id: row.borrowCount },
        })),
      };
    });

    return stats;
  } catch (error) {
    throw new Error(`Error fetching statistics: ${error.message}`);
  }
}

module.exports = {
  borrowBook,
  returnBook,
  getAllBorrowRecords,
  getActiveBorrowRecords,
  getOverdueBooks,
  getMemberBorrowHistory,
  getBookBorrowHistory,
  getBorrowRecordById,
  getLibraryStatistics,
};
