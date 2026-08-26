const express = require("express");
const libraryMemberController = require("../controllers/libraryMemberController");

const router = express.Router();

router.post("/", libraryMemberController.createMember);
router.get("/active", libraryMemberController.getActiveMembers);
router.get("/search", libraryMemberController.searchMembers);
router.get("/", libraryMemberController.getAllMembers);
router.get("/:id", libraryMemberController.getMemberById);
router.put("/:id", libraryMemberController.updateMember);
router.delete("/:id", libraryMemberController.deleteMember);

module.exports = router;
