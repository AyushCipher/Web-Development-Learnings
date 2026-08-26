const mongoose = require("mongoose");

const AuthorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Author name is required"],
    trim: true,
  },
  bio: String,
  email: {
    type: String,
    unique: true,
    sparse: true, // allows null values, but only one null is allowed
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // email validation
  },
  booksPublished: {
    type: Number,
    default: 0,
    min: 0,
  },
  awards: [String],
  birthDate: Date,
  country: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


// INDEXING:
AuthorSchema.index({ name: 1 });
AuthorSchema.index({ email: 1 }, { unique: true, sparse: true });
AuthorSchema.index({ country: 1 });


// MIDDLEWARE:
AuthorSchema.pre("save", function (next) {
  // Ensure email is lowercase
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

AuthorSchema.post("save", function (doc) {
  console.log(`✅ Author saved: ${doc.name}`);
});


// CUSTOM METHODS:
AuthorSchema.methods.incrementBooksPublished = function () {
  this.booksPublished += 1;
  return this.save();
};

module.exports = mongoose.model("Author", AuthorSchema);
