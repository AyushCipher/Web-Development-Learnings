const express = require("express");
const multer = require("multer");

const {
  uploadMedia,
  getAllMedias,
} = require("../controllers/media-controller");
const { authenticateRequest } = require("../middleware/authMiddleware");
const logger = require("../utils/logger");

// configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("file");

module.exports = (uploadLimiter) => {
  const router = express.Router();

  // Q. WHY IS uploadLimiter ONLY ON /upload, NOT ON /get?
  // ANS: uploadLimiter (defined in server.js as 5 uploads/hour) exists to
  // cap the expensive operation - streaming a file to Cloudinary and writing
  // a DB record - not to throttle every request to this router. Reading the
  // media list is a plain DB read and doesn't need the same ceiling.
  router.post(
    "/upload",
    authenticateRequest,
    uploadLimiter,
    (req, res, next) => {
      upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          logger.error("Multer error while uploading:", err);
          return res.status(400).json({
            message: "Multer error while uploading:",
            error: err.message,
            stack: err.stack,
          });
        } else if (err) {
          logger.error("Unknown error occured while uploading:", err);
          return res.status(500).json({
            message: "Unknown error occured while uploading:",
            error: err.message,
            stack: err.stack,
          });
        }

        if (!req.file) {
          return res.status(400).json({
            message: "No file found!",
          });
        }

        next();
      });
    },
    uploadMedia
  );

  router.get("/get", authenticateRequest, getAllMedias);

  return router;
};
