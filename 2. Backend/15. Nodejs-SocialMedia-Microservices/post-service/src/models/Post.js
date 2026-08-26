const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mediaIds: [
      {
        type: String,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Q. WHY A TEXT INDEX HERE IF SEARCH-SERVICE IS WHAT ACTUALLY HANDLES SEARCH?
// ANS: search-service keeps its own copy of post content (synced via the
// "post.created"/"post.deleted" events) and is what MongoDB's $text search
// actually runs against. This index is unused by this service's own
// queries, but it exists so post-service's own Post collection could be
// searched directly if ever needed - MongoDB's $text operator only works
// on a collection that has a text index defined.
postSchema.index({ content: "text" });

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
