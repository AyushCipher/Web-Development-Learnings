const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// compound unique index on (post, user)
likeSchema.index({ post: 1, user: 1 }, { unique: true });

// Q. Why put a unique compound index on (post, user) instead of just checking
// in the controller before creating a Like?
// ANS: An application-level "check then create" is not atomic - two concurrent
// requests from the same user liking the same post can both pass the "does a
// Like already exist?" check before either one has written its document, and
// both would end up creating a Like (a duplicate). A unique compound index is
// enforced by MongoDB itself at the storage layer, so the second insert of the
// same (post, user) pair always fails with a duplicate key error, no matter
// how the two requests are racing. This makes double-liking impossible at the
// data layer, not just something the app tries to prevent in code.

const Like = mongoose.model("Like", likeSchema);

module.exports = Like;
