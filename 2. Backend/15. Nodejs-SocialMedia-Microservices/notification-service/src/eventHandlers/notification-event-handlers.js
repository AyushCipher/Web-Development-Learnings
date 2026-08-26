const Notification = require("../models/Notification");
const logger = require("../utils/logger");

// Q. WHY WRAP THE DB WRITE IN TRY/CATCH INSTEAD OF LETTING A FAILURE
//    PROPAGATE?
// ANS: This callback runs inside the RabbitMQ consumer's message handler
// (see consumeEvent in utils/rabbitmq.js) - an uncaught throw here would
// crash that handler and, depending on how it's driven, could take down
// processing for every other event too. One malformed or unexpected event
// (e.g. a missing postOwnerId) failing to save should only lose that one
// notification, not stop the whole consumer from acking and moving on to
// the next message.
async function handlePostLiked(event) {
  try {
    const newNotification = new Notification({
      recipient: event.postOwnerId,
      actor: event.actorUserId,
      type: "like",
      post: event.postId,
      message: "liked your post",
    });

    await newNotification.save();
    logger.info(
      `Notification created for like on post: ${event.postId}, ${newNotification._id.toString()}`
    );
  } catch (e) {
    logger.error(e, "Error handling post liked event");
  }
}

async function handlePostCommented(event) {
  try {
    const newNotification = new Notification({
      recipient: event.postOwnerId,
      actor: event.actorUserId,
      type: "comment",
      post: event.postId,
      message: "commented on your post",
    });

    await newNotification.save();
    logger.info(
      `Notification created for comment on post: ${event.postId}, ${newNotification._id.toString()}`
    );
  } catch (e) {
    logger.error(e, "Error handling post commented event");
  }
}

module.exports = { handlePostLiked, handlePostCommented };
