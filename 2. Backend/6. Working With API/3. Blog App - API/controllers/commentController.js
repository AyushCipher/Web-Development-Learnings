// import model
const Post = require("../models/postModal1");
const Comment = require("../models/commentModel");


// Business Logic
exports.createComment = async(req, res) => {
    // .create alternate method for creation 
    try{
        // fetch data from req body
        const {post, user, body} = req.body;
        // create a comment object
        const comment = new Comment({
            post, user, body
        });

        // Save the new comment into the database
        const savedComment = await comment.save();

        // Find the post by id, add the new comment to its comment array
        const updatedPost = await Post.findByIdAndUpdate(post, {$push: {comments: savedComment._id}},{new: true} ) // The { new: true } option ensures that the updated document is returned by findByIdAndUpdate. By default, Mongoose returns the original document (before the update), but with { new: true }, it returns the modified version after applying the update.
        .populate("comments") 
        // populates the comments array with comment documents
        // mtlb agr post req kroge to usma comments k key pr sirf id's dikahyege whereas populate krne se wo id k jgah comment k actual object ko access kr k sara values show krta ha
        .exec();

        res.status(200).json({   // is an Express method used to send a JSON-formatted response to the client.
            post: updatedPost,
        });
    }
    catch (error) {
        console.error("Error in createComment:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}
 
