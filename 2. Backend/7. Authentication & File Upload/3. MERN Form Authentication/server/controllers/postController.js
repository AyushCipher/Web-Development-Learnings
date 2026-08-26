// controllers/postController.js
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const User = require("../models/userModel");

// Get all posts
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("admin", "name email role")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name email role",
        },
      });

    const totalPosts = await Post.countDocuments();

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
      },
    });
  } catch (error) {
    console.error("Get All Posts Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single post
const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate("admin", "name email role")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name email role",
        },
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("Get Post By ID Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create post (Admin only)
const createPost = async (req, res) => {
  try {
    const { title, description, image } = req.body;
    const adminId = req.user._id;
    const adminName = req.user.name;

    if (!title || !description || !image) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and image are required",
      });
    }

    const newPost = await Post.create({
      title,
      description,
      image,
      admin: adminId,
      adminName,
    });

    const populatedPost = await newPost.populate("admin", "name email role");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error("Create Post Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update post (Admin only - their own posts)
const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, description, image } = req.body;
    const adminId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.admin.toString() !== adminId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own posts",
      });
    }

    if (title) post.title = title;
    if (description) post.description = description;
    if (image) post.image = image;

    await post.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Update Post Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete post (Admin only - their own posts)
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const adminId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.admin.toString() !== adminId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      });
    }

    // Delete all comments
    await Comment.deleteMany({ post: postId });
    await Post.findByIdAndDelete(postId);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete Post Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Like/Unlike post
const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
      post.likesCount -= 1;
    } else {
      post.likes.push(userId);
      post.likesCount += 1;
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: alreadyLiked ? "Post unliked" : "Post liked",
      post,
    });
  } catch (error) {
    console.error("Like Post Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get admin posts
const getAdminPosts = async (req, res) => {
  try {
    const adminId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ admin: adminId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name email role",
        },
      });

    const totalPosts = await Post.countDocuments({ admin: adminId });

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
      },
    });
  } catch (error) {
    console.error("Get Admin Posts Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user stats
const getUserStats = async (req, res) => {
  try {
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalPosts = await Post.countDocuments();
    const totalComments = await Comment.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalAdmins,
        totalStudents,
        totalPosts,
        totalComments,
      },
    });
  } catch (error) {
    console.error("Get Stats Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getAdminPosts,
  getUserStats,
};
