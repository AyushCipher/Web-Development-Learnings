const Image = require("../models/Image");
const User = require("../models/User");
const { uploadToCloudinary } = require("../helpers/cloudinaryHelper");
const { sendUploadNotification } = require("../helpers/emailHelper");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");


// FLOW:- When a user uploads an image from the frontend, the file is sent to the backend as form data, where Multer processes the request and temporarily stores the file on the server’s local storage.
// Once the file is available locally, it is uploaded to Cloudinary, which securely stores the image in the cloud and generates a public URL along with a unique public ID.
// This URL and public ID are then saved in the MongoDB database instead of the actual image file, making the system more efficient and scalable.
// After a successful upload to Cloudinary, the temporarily stored file on the local server is deleted to free up space and prevent unnecessary storage usage.


const uploadImageController = async (req, res) => {
  try {
    // Check if file is missing in req object
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required. Please upload an image",
      });
    }

    // Optional compression, e.g. POST /api/image/upload?quality=30 - ported
    // over from "2. File Upload(Cloudinary)"'s separate imageSizeReducer
    // endpoint; here it's the same endpoint with an opt-in query param
    // instead of a whole extra route, since it's the exact same upload flow
    // with one different Cloudinary option.
    const quality = req.query.quality ? Number(req.query.quality) : undefined;

    // Upload to cloudinary
    const { url, publicId } = await uploadToCloudinary(req.file.path, {
      resourceType: "image",
      quality,
    });

    // Store the image url and public id along with the uploaded user id in database
    const newlyUploadedImage = new Image({
      url,
      publicId,
      uploadedBy: req.userInfo.userId,
      mediaType: "image",
    });

    await newlyUploadedImage.save();

    // Delete the file from local storage after uploading it to cloudinary
    fs.unlinkSync(req.file.path);

    // Ported over from "2. File Upload(Cloudinary)", which emailed the
    // uploader whenever a file finished saving. Uses the uploader's own
    // registered email instead of a free-text field in the request body,
    // since this route is authenticated.
    const uploader = await User.findById(req.userInfo.userId);
    if (uploader) {
      await sendUploadNotification(uploader.email, "image", url);
    }

    res.status(201).json({
      success: true,
      message: "Imaged uploaded successfully",
      image: newlyUploadedImage,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
    });
  }
};


// Ported over from "2. File Upload(Cloudinary)"'s videoUpload handler -
// same Cloudinary + DB + notification flow as uploadImageController above,
// just with resourceType "video" so Cloudinary stores/serves it correctly.
const uploadVideoController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required. Please upload a video",
      });
    }

    const { url, publicId } = await uploadToCloudinary(req.file.path, {
      resourceType: "video",
    });

    const newlyUploadedVideo = new Image({
      url,
      publicId,
      uploadedBy: req.userInfo.userId,
      mediaType: "video",
    });

    await newlyUploadedVideo.save();

    fs.unlinkSync(req.file.path);

    const uploader = await User.findById(req.userInfo.userId);
    if (uploader) {
      await sendUploadNotification(uploader.email, "video", url);
    }

    res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      video: newlyUploadedVideo,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
    });
  }
};


// Ported over from "2. File Upload(Cloudinary)"'s localFileUpload - saves
// the file to this server's own disk only, no Cloudinary, no DB record.
// Kept behind the same auth+admin gate as the other upload routes (folder
// 2's version had no auth at all) so an anonymous caller can't fill up disk
// space on this server.
const localUploadController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required.",
      });
    }

    res.status(201).json({
      success: true,
      message: "File uploaded locally",
      filePath: req.file.path,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
    });
  }
};


// Fetch images controller with pagination and sorting
const fetchImagesController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const totalImages = await Image.countDocuments();
    const totalPages = Math.ceil(totalImages / limit);

    const sortObj = {};
    sortObj[sortBy] = sortOrder;
    const images = await Image.find().sort(sortObj).skip(skip).limit(limit);

    if (images) {
      res.status(200).json({
        success: true,
        currentPage: page,
        totalPages: totalPages,
        totalImages: totalImages,
        data: images,
      });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
    });
  }
};


// Delete image controller
const deleteImageController = async (req, res) => {
  try {
    const getCurrentIdOfImageToBeDeleted = req.params.id;
    const userId = req.userInfo.userId;

    const image = await Image.findById(getCurrentIdOfImageToBeDeleted);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Check if this image is uploaded by the current user who is trying to delete this image
    if (image.uploadedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: `You are not authorized to delete this image because you haven't uploaded it`,
      });
    }

    // Delete this image first from your cloudinary storage. resource_type
    // must match what it was uploaded as - Cloudinary silently no-ops a
    // destroy call for a video publicId if you don't pass resource_type:
    // "video" here (it defaults to "image").
    await cloudinary.uploader.destroy(image.publicId, {
      resource_type: image.mediaType === "video" ? "video" : "image",
    });

    // Delete this image from mongodb database
    await Image.findByIdAndDelete(getCurrentIdOfImageToBeDeleted);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
    });
  }
};

module.exports = {
  uploadImageController,
  uploadVideoController,
  localUploadController,
  fetchImagesController,
  deleteImageController,
};
