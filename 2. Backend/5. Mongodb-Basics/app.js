const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/mongo-basics")
  .then(() => console.log("database connected successfully"))
  .catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
  isActive: Boolean,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
});

// create user model
const User = mongoose.model("User", userSchema);

async function runQueryExamples() {
  try {

    //create a new document
    const newUser = await User.create({
      name: "Ayush Verma",
      email: "ayush123@gmail.com",
      age: 24,
      isActive: true,
      tags: ["developer"],
    });


    const newUser1 = new User({
      name: "Raj Kumar Verma",
      email: "raj@gmail.com",
      age: 14,
      isActive: false,
      tags: ["developer", "designer", "manager"],
    });
    await newUser1.save();


    console.log("Created first user", newUser);
    console.log("Created second user", newUser1);

    // const allUsers = await User.find({});
    // console.log(allUsers);

    // const getUserOfActiveFalse = await User.find({ isActive: true });        
    // console.log(getUserOfActiveFalse);
        
    // const getFirstUser = await User.findOne({ name: "Ayush Verma" });   
    // console.log(getFirstUser);
    
    // const getLastCreatedUserByUserId = await User.findById(newUser1._id); 
    // console.log(getLastCreatedUserByUserId, "getLastCreatedUserByUserId");
    
    // const selectedFields = await User.find().select("name email -_id");    
    // console.log(selectedFields);
    
    // const limitedUsers = await User.find().limit(5).skip(1);    
    // console.log(limitedUsers);
    
    // const sortedUsers = await User.find().sort({ age: 1 });    
    // console.log(sortedUsers);
    
    // const countDocuments = await User.countDocuments({ isActive: true });    
    // console.log(countDocuments);

    // const deletedUser = await User.findByIdAndDelete(newUser1._id);    
    // console.log("deleted user ->", deletedUser);


    const updateUser = await User.findByIdAndUpdate(
      newUser1._id,
      {
        $set: { age: 100 },
        $push: { tags: "updated" },
      },
      { new: true }
    );
    console.log("updated user", updateUser);
  } catch (e) {
    console.log("Error ->", e);
  } finally {
    await mongoose.connection.close();
  }
}

runQueryExamples();


// Q. WHAT IS MONGOOSE?
// ANS: Mongoose is an ODM (Object Document Mapper) library for MongoDB used in Node.js applications.
// It provides a structured and object-oriented way to interact with MongoDB databases by mapping JavaScript objects to MongoDB documents.

// Q. WHY USE MONGOOSE?
// ANS: MongoDB native driver works directly with raw database operations, which can become repetitive, unstructured, and difficult to manage in large applications.
// Mongoose solves this by providing:

// * schemas
// * models
// * validation
// * middleware
// * hooks
// * query helpers
// * population
// * cleaner syntax

// EXAMPLE: Without Mongoose

// Using native MongoDB:

// db.collection("users").insertOne(...)

// * Less structure.
// * No schema validation.


// With Mongoose:
// const userSchema = new mongoose.Schema({
//   name: String,
//   age: Number
// });

// * More organized and scalable.


// Q. EMBEDDING VS REFERENCING IN MONGODB?

// Embedding in MongoDB means storing related data inside the same document. 
// It is used when related data is small, tightly connected, and frequently fetched together. 
// For example, if a book always needs its author details while fetching, then author data can be embedded directly inside the book document. 
// This improves read performance because everything is fetched using a single query.

// {
//   title: "MongoDB Basics",

//   author: {
//     name: "Ayush Verma",
//     age: 22
//   }
// }


// Referencing in MongoDB means storing related data in separate collections/documents and linking them using IDs (ObjectIds). 
// It is used when data is large, reusable, or shared across multiple documents. 
// For example, if one author writes many books, storing author data repeatedly inside every book would create duplication. 
// Instead, books store only the authorId reference, while actual author details are stored separately.

// Author Document:

// {
//   _id: 101,
//   name: "Ayush Verma"
// }


// Book Document:

// {
//   title: "MongoDB Basics",
//   authorId: 101
// }

// Embedding provides faster reads and simpler queries, while referencing avoids duplicate data and improves scalability and normalization.