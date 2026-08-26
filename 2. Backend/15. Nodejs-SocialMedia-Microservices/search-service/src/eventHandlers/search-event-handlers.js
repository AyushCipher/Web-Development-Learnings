const Search = require("../models/Search");
const logger = require("../utils/logger");
const redisClient = require("../utils/redisClient");

async function invalidateSearchCache() {
  const keys = await redisClient.keys("search:*");
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
}

// Q. WHY DOES search-service REACT TO "post.created"/"post.deleted" EVENTS
//    INSTEAD OF post-service CALLING IT DIRECTLY?
// ANS: Same decoupling reasoning as media-event-handlers.js in media-service
// - post-service publishes without knowing search-service exists, so its
// own index can stay in sync (or fall behind and catch up) without ever
// being a dependency of the post create/delete request path.
async function handlePostCreated(event) {
  try {
    const newSearchPost = new Search({
      postId: event.postId,
      userId: event.userId,
      content: event.content,
      createdAt: event.createdAt,
    });

    await newSearchPost.save();
    await invalidateSearchCache();
    logger.info(
      `Search post created: ${event.postId}, ${newSearchPost._id.toString()}`
    );
  } catch (e) {
    logger.error(e, "Error handling post creation event");
  }
}

async function handlePostDeleted(event) {
  try {
    await Search.findOneAndDelete({ postId: event.postId });
    await invalidateSearchCache();
    logger.info(`Search post deleted: ${event.postId}}`);
  } catch (error) {
    logger.error(error, "Error handling post deletion event");
  }
}

module.exports = { handlePostCreated, handlePostDeleted };
