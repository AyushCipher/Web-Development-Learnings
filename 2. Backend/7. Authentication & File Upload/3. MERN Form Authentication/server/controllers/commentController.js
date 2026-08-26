// controllers/commentController.js
const Comment = require("../models/commentModel");
const Post = require("../models/postModel");

// Create comment
const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;
    const userRole = req.user.role;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const newComment = await Comment.create({
      text,
      author: userId,
      authorName: userName,
      authorRole: userRole,
      post: postId,
    });

    post.comments.push(newComment._id);
    post.commentsCount += 1;
    await post.save();

    const populatedComment = await newComment.populate("author", "name email role");

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Create Comment Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get comments for post
const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name email role");

    const totalComments = await Comment.countDocuments({ post: postId });

    res.status(200).json({
      success: true,
      comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalComments / limit),
        totalComments,
      },
    });
  } catch (error) {
    console.error("Get Comments Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update comment
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own comments",
      });
    }

    comment.text = text;
    await comment.save();

    const populatedComment = await comment.populate("author", "name email role");

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Update Comment Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    const postId = comment.post;

    await Post.findByIdAndUpdate(postId, {
      $pull: { comments: commentId },
      $inc: { commentsCount: -1 },
    });

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete Comment Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Like/Unlike comment
const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const alreadyLiked = comment.likes.includes(userId);

    if (alreadyLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId.toString());
      comment.likesCount -= 1;
    } else {
      comment.likes.push(userId);
      comment.likesCount += 1;
    }

    await comment.save();

    res.status(200).json({
      success: true,
      message: alreadyLiked ? "Comment unliked" : "Comment liked",
      comment,
    });
  } catch (error) {
    console.error("Like Comment Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
  likeComment,
};
