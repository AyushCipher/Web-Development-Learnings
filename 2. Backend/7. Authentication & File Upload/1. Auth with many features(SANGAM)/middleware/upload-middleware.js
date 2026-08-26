const multer = require("multer");
const path = require("path");

// Set our multer storage      ---->      diskStorage engine gives you full control on storing files to disk
const storage = multer.diskStorage({
  destination: function (req, file, cb) { // destination defines where the file will be stored
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,                         // FORMAT: callback(error, result), so null → ❌ No error
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


// File filter function / File Validation function
const checkImageFileFilter = (req, file, cb) => {
  const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  // Check if MIME type is image OR file extension is valid image extension
  if (file.mimetype.startsWith("image") || allowedImageTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images (.jpg, .jpeg, .png, .gif, .webp)"));
  }
};

// Ported over from "2. File Upload(Cloudinary)"'s videoUpload handler, which
// only accepted .mp4/.mov - same allow-list here, just enforced as a Multer
// fileFilter instead of a manual extension check inside the controller.
const checkVideoFileFilter = (req, file, cb) => {
  const allowedVideoTypes = ["video/mp4", "video/quicktime"];
  const allowedExtensions = [".mp4", ".mov"];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (file.mimetype.startsWith("video") || allowedVideoTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error("Not a video! Please upload only .mp4 or .mov files"));
  }
};

// Three separate multer instances since each accepts a different set of file
// types: images only, videos only, or (for local-upload) anything within the
// size limit - keeping them separate means a bad video can't sneak through
// the image endpoint's filter and vice versa.
const uploadImage = multer({
  storage,
  fileFilter: checkImageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});

const uploadVideo = multer({
  storage,
  fileFilter: checkVideoFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // same 5MB limit "2. File Upload(Cloudinary)" used for video
  },
});

// No fileFilter - matches "2. File Upload(Cloudinary)"'s localFileUpload,
// which accepted any file type since it never leaves this server.
const uploadAny = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = { uploadImage, uploadVideo, uploadAny };

// Q. WHAT IS MULTER?
// ANS: Multer is a middleware used in Express.js applications for handling multipart/form-data, mainly used for file uploads such as images, videos, PDFs, or documents.
// Browsers cannot send files as normal JSON data because files contain binary data, so Multer parses incoming file data and temporarily stores uploaded files either in memory or on the server filesystem before further processing.

// Example:

// upload.single("image")

// This middleware extracts uploaded file from request.
