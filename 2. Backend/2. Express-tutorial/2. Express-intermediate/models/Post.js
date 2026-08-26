// Q. WHAT ARE MODELS IN EXPRESS?
// ANS: Models represent the structure of database data and handle database interactions. 
// In Mongoose, models are created using schemas that define fields, validation rules, relationships, and database behavior.
// Models provide an abstraction layer over the database so developers can interact with data using JavaScript methods instead of raw database queries.


const mongoose = require('mongoose');

// Post Schema
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to User model - for .populate()
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  tags: [String],
  published: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
