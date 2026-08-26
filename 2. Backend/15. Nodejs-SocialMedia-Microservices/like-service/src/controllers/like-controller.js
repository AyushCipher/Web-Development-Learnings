const Like = require("../models/Like");
const logger = require("../utils/logger");
const { publishEvent } = require("../utils/rabbitmq");

// Q. Why does like-service call post-service over HTTP instead of just
// trusting whatever postId the client sends?
// ANS: A client could send any string as :postId, including IDs for posts
// that were deleted or never existed. If we blindly created a Like for it,
// we'd end up with orphaned Like documents pointing at nothing, and the
// like-count / notification logic would be operating on garbage. Calling
// post-service's GET /api/posts/:id lets the source of truth for posts
// confirm the post is real (and tells us who owns it, so we know whether to
// notify them) before we commit to anything in this service.
async function fetchPost(postId, requestingUserId) {
  const response = await fetch(
    `${process.env.POST_SERVICE_URL}/api/posts/${postId}`,
    {
      headers: {
        // post-service's GET /:id route sits behind authenticateRequest too,
        // so it needs an x-user-id header or it will 401 (not 404) - we
        // forward the id of the user making the like request.
        "x-user-id": requestingUserId,
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    let post;
    try {
      post = await fetchPost(postId, userId);
    } catch (e) {
      logger.error("Error reaching post-service", e);
      post = null;
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const postOwnerId = post.user;
    const countKey = `likes:count:${postId}`;

    const existingLike = await Like.findOne({ post: postId, user: userId });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      await req.redisClient.decr(countKey);

      logger.info(`User ${userId} unliked post ${postId}`);
      return res.status(200).json({
        success: true,
        liked: false,
      });
    }

    await Like.create({ post: postId, user: userId });
    await req.redisClient.incr(countKey);

    if (userId !== postOwnerId?.toString()) {
      await publishEvent("post.liked", {
        postId,
        actorUserId: userId,
        postOwnerId,
      });
    }

    logger.info(`User ${userId} liked post ${postId}`);
    res.status(200).json({
      success: true,
      liked: true,
    });
  } catch (e) {
    logger.error("Error toggling like", e);
    res.status(500).json({
      success: false,
      message: "Error toggling like",
    });
  }
};

// Q. Why read the like count from Redis (INCR/DECR) instead of running
// Like.countDocuments({ post: postId }) on every request?
// ANS: countDocuments is a real query that has to scan/count matching
// documents, which gets slower as the number of likes grows and adds load to
// mongo on every single count read (likes counts are read far more often
// than they change). A Redis integer that we INCR/DECR alongside each write
// gives us an O(1) read with no database round trip. The trade-off is that
// this counter is only eventually consistent with the real number of Like
// documents: if the process crashes between creating/deleting the Like and
// updating Redis, the counter can drift from the truth. That's not handled
// here - a real fix would be a periodic reconciliation job that recomputes
// Like.countDocuments({ post: postId }) and overwrites the Redis key, but for
// this service the fast/eventually-consistent counter is the deliberate
// trade-off.
const getLikeCount = async (req, res) => {
  try {
    const { postId } = req.params;
    const countKey = `likes:count:${postId}`;

    const count = await req.redisClient.get(countKey);

    res.status(200).json({
      success: true,
      count: count ? parseInt(count, 10) : 0,
    });
  } catch (e) {
    logger.error("Error fetching like count", e);
    res.status(500).json({
      success: false,
      message: "Error fetching like count",
    });
  }
};

const getMyLikeStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const existingLike = await Like.findOne({ post: postId, user: userId });

    res.status(200).json({
      success: true,
      liked: !!existingLike,
    });
  } catch (e) {
    logger.error("Error fetching like status", e);
    res.status(500).json({
      success: false,
      message: "Error fetching like status",
    });
  }
};

module.exports = { toggleLike, getLikeCount, getMyLikeStatus };
