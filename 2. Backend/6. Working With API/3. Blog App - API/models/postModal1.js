// import mongoose to define and work with schemas/models and interact with the MongoDB database.
const mongoose = require("mongoose");

// WHAT IS SCHEMA?
// A schema is like a blueprint for the documents in a MongoDB collection.

// route handler 
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    likes: [
        {
            // mongoose.Schema.Types.ObjectId --> is a specific data type in MongoDB used to represent the unique identifier (_id) for documents.
            type: mongoose.Schema.Types.ObjectId,
            ref: "like", // Referencing Like model
        },
    ], 
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "comment", // Referencing Comment model 
    }],
});

// export 
module.exports = mongoose.model("Post", postSchema);
