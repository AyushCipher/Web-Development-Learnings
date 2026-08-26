const mongoose = require("mongoose");

const searchPostSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Q. WHY THE TEXT INDEX HERE (SAME AS Post.js IN post-service)?
// ANS: This is the collection MongoDB's $text search actually runs against
// - searchPostController (search-controller.js) queries this Search model,
// not post-service's Post model - so this is the index that matters for the
// $text operator to work at all. createdAt is indexed separately to keep
// the default newest-first sort/pagination cheap.
searchPostSchema.index({ content: "text" });
searchPostSchema.index({ createdAt: -1 });

const Search = mongoose.model("Search", searchPostSchema);
module.exports = Search;
