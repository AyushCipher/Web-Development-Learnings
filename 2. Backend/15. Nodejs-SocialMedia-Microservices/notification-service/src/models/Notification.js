const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment"],
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

// Q. Why index on { recipient: 1, createdAt: -1 } instead of just
// { recipient: 1 }?
// ANS: The main query pattern for this service is "give me this user's
// notifications, sorted newest first" - i.e. a find({ recipient }) followed
// by a sort({ createdAt: -1 }). A single-field index on recipient would let
// mongo find the matching documents quickly, but it would still have to
// sort them in memory afterwards. A compound index that also includes
// createdAt in descending order lets mongo return the documents already in
// the right order straight off the index, with no separate in-memory sort
// step, which matters once a user has a large notification history.

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
