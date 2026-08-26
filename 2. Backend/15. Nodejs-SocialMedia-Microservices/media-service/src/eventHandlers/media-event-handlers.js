const Media = require("../models/Media");
const { deleteMediaFromCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");

// Q. WHY DOES media-service REACT TO A "post.deleted" EVENT INSTEAD OF
//    post-service CALLING media-service'S API DIRECTLY WHEN A POST IS
//    DELETED?
// ANS: Same decoupling reasoning as the exchange/reconnect comments in
// rabbitmq.js - post-service's deletePost controller just publishes
// "post.deleted" and moves on, with no idea media-service exists or cares.
// If a direct API call were used instead, post-service would have to know
// media-service's address, handle its failures/timeouts synchronously, and
// deletePost would fail (or hang) if media-service were ever down. As an
// event handler, this cleanup can lag behind, retry, or even be added to a
// brand new consumer later, without touching post-service at all.
const handlePostDeleted = async (event) => {
  const { postId, mediaIds } = event;
  try {
    const mediaToDelete = await Media.find({ _id: { $in: mediaIds } });

    for (const media of mediaToDelete) {
      await deleteMediaFromCloudinary(media.publicId);
      await Media.findByIdAndDelete(media._id);

      logger.info(
        `Deleted media ${media._id} associated with this deleted post ${postId}`
      );
    }

    logger.info(`Processed deletion of media for post id ${postId}`);
  } catch (e) {
    logger.error(e, "Error occured while media deletion");
  }
};

module.exports = { handlePostDeleted };
