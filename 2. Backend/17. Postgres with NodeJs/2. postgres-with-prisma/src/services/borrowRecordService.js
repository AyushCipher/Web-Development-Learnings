const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BORROWING_PERIOD_DAYS = 14; // 2 weeks
const FINE_PER_DAY = 10; // 10 currency units per day

// Create a borrow record (member borrows a book)
async function borrowBook(bookId, memberId) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check if book exists and has stock
      const book = await tx.book.findUnique({
        where: { id: bookId },
      });

      if (!book) {
        throw new Error(`Book with id ${bookId} not found`);
      }

      if (book.stock <= 0) {
        throw new Error("Book is out of stock");
      }

      // Check if member exists
      const member = await tx.libraryMember.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new Error(`Member with id ${memberId} not found`);
      }

      if (!member.isActive) {
        throw new Error("Member is not active");
      }

      // Check if member already has this book borrowed and not returned
      const activeBorrow = await tx.borrowRecord.findFirst({
        where: {
          bookId,
          memberId,
          returnedDate: null,
        },
      });

      if (activeBorrow) {
        throw new Error("Member already has this book borrowed");
      }

      // Decrease book stock
      await tx.book.update({
        where: { id: bookId },
        data: { stock: book.stock - 1 },
      });

      // Create borrow record (fetched after the stock update so the
      // returned book relation reflects the post-decrement stock)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + BORROWING_PERIOD_DAYS);

      const borrowRecord = await tx.borrowRecord.create({
        data: {
          bookId,
          memberId,
          dueDate,
        },
        include: {
          book: { include: { author: true } },
          member: true,
        },
      });

      return borrowRecord;
    });

    return result;
  } catch (error) {
    throw new Error(`Error borrowing book: ${error.message}`);
  }
}

// Return a borrowed book
async function returnBook(borrowRecordId) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get the borrow record
      const borrowRecord = await tx.borrowRecord.findUnique({
        where: { id: borrowRecordId },
        include: { book: true, member: true },
      });

      if (!borrowRecord) {
        throw new Error(`Borrow record with id ${borrowRecordId} not found`);
      }

      if (borrowRecord.returnedDate) {
        throw new Error("Book has already been returned");
      }

      // Calculate fine if book is returned late
      const today = new Date();
      let fine = 0;

      if (today > borrowRecord.dueDate) {
        const daysLate = Math.floor(
          (today - borrowRecord.dueDate) / (1000 * 60 * 60 * 24)
        );
        fine = daysLate * FINE_PER_DAY;
      }

      // Increase book stock
      await tx.book.update({
        where: { id: borrowRecord.bookId },
        data: { stock: borrowRecord.book.stock + 1 },
      });

      // Update borrow record (fetched after the stock update so the
      // returned book relation reflects the post-increment stock)
      const updatedRecord = await tx.borrowRecord.update({
        where: { id: borrowRecordId },
        data: {
          returnedDate: today,
          fine,
        },
        include: {
          book: { include: { author: true } },
          member: true,
        },
      });

      return updatedRecord;
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
    const [records, total] = await Promise.all([
      prisma.borrowRecord.findMany({
        skip,
        take: limit,
        include: {
          book: { include: { author: true } },
          member: true,
        },
        orderBy: { borrowDate: "desc" },
      }),
      prisma.borrowRecord.count(),
    ]);

    return {
      data: records,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Error fetching borrow records: ${error.message}`);
  }
}

// Get active borrow records (not returned)
async function getActiveBorrowRecords(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      prisma.borrowRecord.findMany({
        where: { returnedDate: null },
        skip,
        take: limit,
        include: {
          book: { include: { author: true } },
          member: true,
        },
        orderBy: { borrowDate: "desc" },
      }),
      prisma.borrowRecord.count({ where: { returnedDate: null } }),
    ]);

    return {
      data: records,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Error fetching active borrow records: ${error.message}`);
  }
}

// Get overdue books
async function getOverdueBooks(page = 1, limit = 10) {
  try {
    const today = new Date();
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      prisma.borrowRecord.findMany({
        where: {
          returnedDate: null,
          dueDate: { lt: today },
        },
        skip,
        take: limit,
        include: {
          book: { include: { author: true } },
          member: true,
        },
        orderBy: { dueDate: "asc" },
      }),
      prisma.borrowRecord.count({
        where: {
          returnedDate: null,
          dueDate: { lt: today },
        },
      }),
    ]);

    return {
      data: records,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Error fetching overdue books: ${error.message}`);
  }
}

// Get borrow history of a member
async function getMemberBorrowHistory(memberId, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      prisma.borrowRecord.findMany({
        where: { memberId },
        skip,
        take: limit,
        include: {
          book: { include: { author: true } },
          member: true,
        },
        orderBy: { borrowDate: "desc" },
      }),
      prisma.borrowRecord.count({ where: { memberId } }),
    ]);

    return {
      data: records,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Error fetching member borrow history: ${error.message}`);
  }
}

// Get borrow history of a book
async function getBookBorrowHistory(bookId, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      prisma.borrowRecord.findMany({
        where: { bookId },
        skip,
        take: limit,
        include: {
          member: true,
          book: true,
        },
        orderBy: { borrowDate: "desc" },
      }),
      prisma.borrowRecord.count({ where: { bookId } }),
    ]);

    return {
      data: records,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Error fetching book borrow history: ${error.message}`);
  }
}

// Get borrow record by ID
async function getBorrowRecordById(id) {
  try {
    const record = await prisma.borrowRecord.findUnique({
      where: { id },
      include: {
        book: { include: { author: true, publisher: true } },
        member: true,
      },
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
    const stats = await prisma.$transaction(async (tx) => {
      const totalBorrows = await tx.borrowRecord.count();
      const activeBorrows = await tx.borrowRecord.count({
        where: { returnedDate: null },
      });
      const overdueBooks = await tx.borrowRecord.count({
        where: {
          returnedDate: null,
          dueDate: { lt: new Date() },
        },
      });

      const totalFine = await tx.borrowRecord.aggregate({
        where: { returnedDate: { not: null } },
        _sum: { fine: true },
      });

      const mostPopularBooks = await tx.borrowRecord.groupBy({
        by: ["bookId"],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
        take: 5,
      });

      return {
        totalBorrows,
        activeBorrows,
        overdueBooks,
        totalFineCollected: totalFine._sum.fine || 0,
        mostPopularBooks,
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
