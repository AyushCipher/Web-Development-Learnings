// import mongoose
const mongoose = require("mongoose");

// route handler
const commentSchema = new mongoose.Schema({
    post:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post", // refer to the id of post model
    },
    user: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    }
});

// export 
module.exports = mongoose.model("comment", commentSchema);




// Q. THERE EXISTS RELATIONSHIP BETWEEN POST, LIKE AND COMMENT DESPITR MONGODB BEING NON-RELATIONAL DATABASE. WHY?

// If your Post, Comment, and Like models are interrelated (through postId), it might seem as if you're working with relationships, which is characteristic of relational databases. 
// However, the key reason MongoDB (and similar databases) is classified as non-relational lies in how those relationships are handled and managed.



// 1. Relationships Exist, but They’re Not Enforced by MongoDB:-

// In a relational database, relationships are enforced by the database engine through foreign keys, constraints, and integrity rules. 
// For example:
// * A postId in the Like table must always refer to an existing post in the Post table.

// * If a Post is deleted, the database ensures that all corresponding Likes and Comments are also removed (via cascading deletes).

// * In MongoDB, these relationships are not enforced at the database level. MongoDB treats postId as a simple field in the document,
// and it's your application logic that ensures: A postId in Like actually corresponds to an existing Post.

// * Data integrity is maintained when a Post is deleted.


// 2. Non-Relational Nature of MongoDB:-
// MongoDB is considered non-relational because:

// * It doesn’t use foreign keys: The database does not validate that the postId in your Like or Comment collections corresponds to a document in the Post collection.
// * Data can be denormalized: In MongoDB, you can embed Likes and Comments directly into a Post document (denormalization). 
// This flexibility is a hallmark of non-relational databases and is not typical of relational databases.
// * No joins.: Relational databases rely on joins to combine data from different tables. 
// In MongoDB, related data is typically fetched using separate queries or with aggregation pipelines.


// 3. Application-Level Relationship Management:-
// In your blog app:

// * The postId in Like and Comment collections is purely a reference.
// * It’s your application code that manages these relationships, ensuring that:
    // * postId in Like and Comment collections is valid.
    // * Related Likes and Comments are deleted when a Post is removed.
// * This is different from relational databases, where such management is enforced by the database itself.


// 4. Use of Non-Relational Databases in Applications with Relationships:-
// MongoDB is commonly used in applications that involve related data (like yours) because:

// It provides flexibility to model relationships in a way that best suits your application.
// You can embed or reference related data based on your needs:
// Embedding: Store likes and comments as arrays inside Post documents (useful for read-heavy operations).
// Referencing: Use postId in separate Like and Comment collections (useful for write-heavy operations or when the data grows significantly).
// Why MongoDB is Still Non-Relational Despite Relationships:
// Flexibility: Relationships in MongoDB are not rigidly enforced.
// Schema-less Nature: MongoDB does not require a fixed schema, unlike relational databases.
// Denormalization: Relationships can be flattened (e.g., embedding likes and comments in a Post document).
// No Built-in Integrity Checks: MongoDB does not check the validity of references between collections (e.g., postId in Like pointing to a valid Post).