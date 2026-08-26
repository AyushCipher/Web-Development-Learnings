const express = require("express");
const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware = require("../middleware/admin-middleware");
const { uploadImage, uploadVideo, uploadAny } = require("../middleware/upload-middleware");
const {
  uploadImageController,
  uploadVideoController,
  localUploadController,
  fetchImagesController,
  deleteImageController,
} = require("../controllers/image-controller");

const router = express.Router();

// Upload the image. Add ?quality=<0-100> to compress on the way in - see
// uploadImageController.
router.post(
  "/upload",
  authMiddleware,
  adminMiddleware,
  uploadImage.single("image"),
  uploadImageController
);

// Upload a video (.mp4/.mov, 5MB max) - ported over from
// "2. File Upload(Cloudinary)"'s videoUpload endpoint.
router.post(
  "/upload-video",
  authMiddleware,
  adminMiddleware,
  uploadVideo.single("video"),
  uploadVideoController
);

// Save a file to this server's disk only, no Cloudinary/DB - ported over
// from "2. File Upload(Cloudinary)"'s localFileUpload endpoint.
router.post(
  "/local-upload",
  authMiddleware,
  adminMiddleware,
  uploadAny.single("file"),
  localUploadController
);

// To get all the images
router.get("/get", authMiddleware, fetchImagesController);

// Delete image route
router.delete("/:id", authMiddleware, adminMiddleware, deleteImageController);

module.exports = router;



// 69de7ec6fec55e673067a2c6
