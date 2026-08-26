const express = require("express");
const publisherController = require("../controllers/publisherController");

const router = express.Router();

router.post("/", publisherController.createPublisher);
router.get("/", publisherController.getAllPublishers);
router.get("/country/:country", publisherController.getPublishersByCountry);
router.get("/:id", publisherController.getPublisherById);
router.put("/:id", publisherController.updatePublisher);
router.delete("/:id", publisherController.deletePublisher);

module.exports = router;
