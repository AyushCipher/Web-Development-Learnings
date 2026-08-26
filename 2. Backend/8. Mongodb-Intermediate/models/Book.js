const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Book title is required"],
    trim: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,  // Stores ID of author, not full data
    ref: "Author",
    required: true,
  },
  isbn: {
    type: String,
    unique: true,   // no duplicates
    sparse: true,   // only apply uniqueness if value exists
  },
  publishYear: Number,
  genre: [String],
  price: {
    type: Number,
    min: 0,
  },
  stock: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reviews: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


// INDEXING:
BookSchema.index({ title: 1 });
BookSchema.index({ author: 1 });
BookSchema.index({ genre: 1 });
BookSchema.index({ publishYear: -1 }); // Descending: New books appear first

// Single index with multiple options: It ensures no duplicate ISBN and allows missing ISBN
BookSchema.index({ isbn: 1 }, { unique: true, sparse: true }); 

// Text index for full-text search
BookSchema.index({ title: "text", genre: "text" });

// Compound index for common queries: Books by author sorted by latest
BookSchema.index({ author: 1, publishYear: -1 });



// MIDDLEWARE HOOKS: 
BookSchema.pre("save", function (next) {
  // Validation: stock cannot be negative
  // If stock is negative → fix it
  if (this.stock < 0) {
    this.stock = 0;
  }
  next();
});

BookSchema.post("save", function (doc) {
  console.log(`✅ Book saved: ${doc.title}`);
});



// CUSTOM/INSTANCE METHODS: 
BookSchema.methods.borrowBook = function () {
  if (this.stock > 0) {
    this.stock -= 1;
    return this.save();
  } else {
    throw new Error("Book not available!");
  }
};

BookSchema.methods.returnBook = function () {
  this.stock += 1;
  return this.save();
};



// STATIC METHODS:
BookSchema.statics.findByAuthor = function (authorId) {
  return this.find({ author: authorId });
};

BookSchema.statics.findPopularBooks = function () {
  return this.find({ rating: { $gte: 4 } }).sort({ rating: -1 });
};

module.exports = mongoose.model("Book", BookSchema);

// Q. What does type: mongoose.Schema.Types.ObjectId mean?
// Ans- MongoDB stores each document with a unique _id (called an ObjectId).
// Here, you are saying: “The author field will store an ObjectId.”
// So instead of storing full author data inside the book, you store just the ID of the author document.

// Q. WHY use ObjectId instead of embedding full author data?
// ANS: * Data consistency: If author details change, you only update one place (the author document).
// * Less duplication: You don’t repeat author info in every book document.


// Q. How do you get author details when you have only the ObjectId in the book document? 
// ANS: You use a feature called “population” in Mongoose. It allows you to replace the author ObjectId with the actual author document when you query for books. 
// For example:

// Book.find().populate("author").exec((err, books) => {
//   // Each book's author field will now contain the full author document instead of just the ID
// });

// This is how you can easily access author details when fetching books, while still maintaining a clean and efficient data structure.



// Q. What is the purpose of the pre and post save hooks in Mongoose? 
// ANS: The pre and post save hooks in Mongoose allow you to run custom logic before and after a document is saved to the database.

// The pre save hook (pre("save")) is executed before the document is saved. You can use it for tasks like validation, modifying data, or setting default values. 
// For example, in the code above, we use a pre save hook to ensure that the stock of a book cannot be negative. If someone tries to save a book with a negative stock, we automatically set it to 0 before saving.

// The post save hook (post("save")) is executed after the document has been saved. You can use it for tasks like logging, sending notifications, or performing additional actions that depend on the saved document. 
// In the code above, we use a post save hook to log a message to the console whenever a book is saved, showing the title of the book that was saved.


// Q. Why is it necessary to add a createdAt field in databases?
// ANS: The createdAt field is used to store the exact date and time when a record is created in the database. It is important because it helps track when users, orders, products, messages, or other records were added. 
// This information is useful for sorting data, generating reports and analytics, debugging issues, auditing system activity, implementing expiration features such as OTP validity, and displaying information like "joined on" or "posted 2 days ago." 
// Although not mandatory for every table, adding a createdAt field is considered a best practice in most real-world applications because it provides valuable historical and operational information about the data.