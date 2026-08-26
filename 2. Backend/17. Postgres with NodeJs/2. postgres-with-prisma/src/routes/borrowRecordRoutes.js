const express = require("express");
const borrowRecordController = require("../controllers/borrowRecordController");

const router = express.Router();

router.post("/borrow", borrowRecordController.borrowBook);
router.put("/:id/return", borrowRecordController.returnBook);
router.get("/", borrowRecordController.getAllBorrowRecords);
router.get("/active", borrowRecordController.getActiveBorrowRecords);
router.get("/overdue", borrowRecordController.getOverdueBooks);
router.get("/statistics", borrowRecordController.getLibraryStatistics);
router.get("/member/:memberId", borrowRecordController.getMemberBorrowHistory);
router.get("/book/:bookId", borrowRecordController.getBookBorrowHistory);
router.get("/:id", borrowRecordController.getBorrowRecordById);

module.exports = router;
