const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Lets one collection serve both the original image-upload route and the
    // new video-upload route (see controllers/image-controller.js) instead of
    // needing a separate Video model with near-identical fields.
    mediaType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Image", ImageSchema);
