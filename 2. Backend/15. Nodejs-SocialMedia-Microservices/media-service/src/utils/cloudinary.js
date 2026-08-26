const cloudinary = require("cloudinary").v2;
const logger = require("./logger");

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

const uploadMediaToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    // Q. WHY resource_type: "auto" INSTEAD OF SPECIFYING "image" OR "video"?
    // ANS: The upload route (media-routes.js) accepts any file up to 5MB
    // without restricting mimetype ahead of time, so Cloudinary is left to
    // detect whether the buffer is an image, video, or raw file itself -
    // "auto" is what makes that detection happen instead of the upload
    // failing (or silently mis-typing the asset) for anything that isn't
    // the one hardcoded type.
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          logger.error("Error while uploading media to cloudinary", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(file.buffer);
  });
};

const deleteMediaFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info("Media deleted successfuly from cloud stroage", publicId);
    return result;
  } catch (error) {
    logger.error("Error deleting media from cludinary", error);
    throw error;
  }
};

module.exports = { uploadMediaToCloudinary, deleteMediaFromCloudinary };
