const cloudinary = require("../config/cloudinary");

// Technically you can store images in MongoDB (using Binary/BSON or GridFS)

// Problems with storing images in MongoDB:
// 1. It can lead to increased database size, which can impact performance and scalability.
// 2. Fetching image = fetching big binary data from database, which can be slow and resource-intensive.
// 3. Serving images from MongoDB can be less efficient than using a dedicated cloud storage service like Cloudinary, which is optimized for delivering media content.
// 4. Backup & scaling problems DB backups become huge Hard to scale when storing media + data together
 
// `resourceType` ("image" | "video") tells Cloudinary which storage/processing
// pipeline to use - ported over from "2. File Upload(Cloudinary)", which used
// `resource_type: "auto"` for the same purpose. `quality` (0-100) is the same
// compression knob that project's imageSizeReducer endpoint used
// (`options.quality = quality`) - passed through only when provided, so a
// plain upload keeps Cloudinary's own default quality.
const uploadToCloudinary = async (filePath, { resourceType = "image", quality } = {}) => {
  try {
    const options = { resource_type: resourceType };

    if (quality) {
      options.quality = quality;
    }

    const result = await cloudinary.uploader.upload(filePath, options);

    return {
      url: result.secure_url, // Public ID is a unique name/identifier given to your uploaded file in order to fetch/update/replace/delete an image
      publicId: result.public_id,  // Secure URL is the actual HTTPS link to access the file.
    };

  } catch (error) {
    console.error("Error while uploading to cloudinary", error);
    throw new Error("Error while uploading to cloudinary");
  }
};

module.exports = { uploadToCloudinary }; 

// Q. WHAT IS CLOUDINARY?
// ANS: Cloudinary is a cloud-based media storage and optimization service used for storing images and videos. 
// Instead of storing files directly on backend servers, developers upload media to Cloudinary which provides:

// * cloud storage
// * CDN delivery
// * automatic optimization
// * resizing
// * compression
// * transformations

// Cloudinary returns:
// * hosted image URLs
// * public IDs
// * optimized assets

// which frontend applications can directly use.




// Q. HOW MULTER AND CLOUDINARY WORK TOGETHER?

// Frontend uploads image
//         ↓
// Multer receives file
//         ↓
// File temporarily stored on server
//         ↓
// Backend uploads file to Cloudinary
//         ↓
// Cloudinary stores image permanently
//         ↓
// Cloudinary URL returned
//         ↓
// Temporary server file deleted



// Q. WHY WE USUALLY DON'T DIRECTLY UPLOAD TO CLOUDINARY FROM FRONTEND?
// ANS: Direct frontend-to-Cloudinary uploads are possible, but many production applications avoid it because:
// * secret API credentials must remain hidden
// * backend validation/security checks may be required
// * user authentication may be necessary
// * file size/type restrictions needed
// * image moderation/compression may happen
// * business logic execution may be required

// Using backend middleware like Multer provides:
// * better security
// * centralized control
// * validation layer
// * safer uploads
