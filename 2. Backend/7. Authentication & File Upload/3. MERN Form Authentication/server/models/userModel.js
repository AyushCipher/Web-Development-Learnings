// models/userModel.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name."],
  },
  email: {
    type: String,
    required: [true, "Please enter your email."],
    unique: true,
  },
  password: {
    type: String,
    minlength: [8, "Password must be at least 8 characters."],
    maxlength: [132, "Password cannot exceed 132 characters."],
    select: false, // Don't send password by default
  },
  phone: {
    type: String,
    required: [true, "Please enter your phone number."],
  },
  accountVerified: {
    type: Boolean,
    default: false,
  },
  role: {
  type: String,
  enum: ["student", "admin"],
  default: "student",
},

  verificationCode: Number,
  verificationCodeExpire: Date,

  resetPasswordToken: String,
  resetPasswordExpire: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
