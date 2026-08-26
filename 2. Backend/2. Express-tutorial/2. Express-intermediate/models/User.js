const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  age: {
    type: Number,
    default: 0
  },
  city: {
    type: String,
    default: 'Unknown'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'  // Reference to Post model
  }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
