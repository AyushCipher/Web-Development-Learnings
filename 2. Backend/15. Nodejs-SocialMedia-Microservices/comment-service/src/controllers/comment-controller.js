const Comment = require("../models/Comment");
const logger = require("../utils/logger");
const { publishEvent } = require("../utils/rabbitmq");
const { validateCreateComment } = require("../utils/validation");

async function invalidateCommentsCache(req, postId) {
  const keys = await req.redisClient.keys(`comments:${postId}:*`);
  if (keys.length > 0) {
    await req.redisClient.del(keys);
  }
}

// Q. Why call post-service BEFORE creating the comment, instead of saving
// the comment first and validating the post afterwards?
// ANS: Fail fast. If the post doesn't exist (deleted, bad id, typo) we want
// to reject the request with a 404 before we write anything to our own
// database. Doing it the other way round would let orphaned comments pile
// up for posts that never existed.
const createComment = async (req, res) => {
  logger.info("Create comment endpoint hit");
  try {
    const { error } = validateCreateComment(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { postId } = req.params;
    const { text } = req.body;

    // Q. Why forward x-user-id on this internal call instead of calling
    // post-service anonymously?
    // ANS: post-service's authenticateRequest middleware guards every
    // route, including reading a single post, and trusts x-user-id the
    // same way it would coming from the gateway. Forwarding the caller's
    // id lets comment-service act as a trusted internal caller without
    // re-implementing JWT verification here.
    const postResponse = await fetch(
      `${process.env.POST_SERVICE_URL}/api/posts/${postId}`,
      {
        headers: {
          "x-user-id": req.user.userId,
          "x-request-id": req.requestId,
        },
      }
    );

    if (postResponse.status === 404) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (!postResponse.ok) {
      throw new Error(`post-service responded with status ${postResponse.status}`);
    }

    const post = await postResponse.json();
    const postOwnerId = post.user;

    const newlyCreatedComment = new Comment({
      post: postId,
      user: req.user.userId,
      text,
    });

    await newlyCreatedComment.save();

    await invalidateCommentsCache(req, postId);

    // Q. Why skip publishing the event when the commenter is the post owner?
    // ANS: Nobody needs a "you commented on your own post" notification.
    if (req.user.userId !== postOwnerId) {
      await publishEvent("post.commented", {
        postId,
        actorUserId: req.user.userId,
        postOwnerId,
        commentText: text,
      });
    }

    logger.info("Comment created successfully", newlyCreatedComment);
    res.status(201).json({
      success: true,
      comment: newlyCreatedComment,
    });
  } catch (e) {
    logger.error("Error creating comment", e);
    res.status(500).json({
      success: false,
      message: "Error creating comment",
    });
  }
};

const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const cacheKey = `comments:${postId}:${page}:${limit}`;
    const cachedComments = await req.redisClient.get(cacheKey);

    if (cachedComments) {
      return res.json(JSON.parse(cachedComments));
    }

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalNoOfComments = await Comment.countDocuments({ post: postId });

    const result = {
      comments,
      currentpage: page,
      totalPages: Math.ceil(totalNoOfComments / limit),
      totalComments: totalNoOfComments,
    };

    // save comments in redis cache
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

    res.json(result);
  } catch (e) {
    logger.error("Error fetching comments", e);
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
    });
  }
};

// Q. Why only let the comment's author delete it, and not the post owner
// too?
// ANS: Keeping it simple for this version. A post owner moderating (i.e.
// removing) other people's comments is a separate feature with its own
// notification/audit concerns. Author-only deletion is the safe minimal
// default here; extending it to post-owner moderation later is a small,
// additive change rather than something we need to get right now.
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    await Comment.findByIdAndDelete(commentId);

    await invalidateCommentsCache(req, comment.post.toString());

    res.json({
      success: true,
      message: "Comment deleted",
    });
  } catch (e) {
    logger.error("Error deleting comment", e);
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
    });
  }
};

module.exports = { createComment, getComments, deleteComment };
