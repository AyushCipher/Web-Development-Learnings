// import 
const Post = require("../models/postModal1");
const Like = require("../models/likeModel");


exports.likePost = async(req, res) => {
    try{
        // fetch data from req body
        const {post, user} = req.body;
        
        // Validation
        if (!post || !user) {
            return res.status(400).json({
                error: "post and user are required",
            });
        }
        
        // create a Like object
        const like = new Like({
            post, user,
        })
        // Save the new Like into the database
        const savedLike = await like.save();

        // update the post collection based on this
        const updatedPost = await Post.findByIdAndUpdate(post, {$push: {likes: savedLike._id}}, {new: true}).
        populate("likes").exec();

        res.json({
            post: updatedPost,
        });

    }
    catch(error){
        console.error("Error in likePost:", error);
        return res.status(400).json({
            error: "Error while liking post",
            message: error.message,
        });
    }
}


// Unlike a post
exports.unlikePost = async(req,res) => {
    try{
        const {post, like} = req.body; // post ki id pass krne se post obj k collection ma se like ko delete kr skte ha and like ki id pass krne se like k collection ma se like ko delete kr skte ha
        
        // Validation
        if (!post || !like) {
            return res.status(400).json({
                error: "post and like are required",
            });
        }

        // find and delete the like collection
        const deletedLike =  await Like.findOneAndDelete({post:post, _id: like});

        if (!deletedLike) {
            return res.status(404).json({
                error: "Like not found",
            });
        }

        // update the post collection
        const updatedPost = await Post.findByIdAndUpdate(post, {$pull: {likes: deletedLike._id}}, {new: true});

        res.json({
            post: updatedPost,
        });
    }
    catch(error){
        console.error("Error in unlikePost:", error);
        return res.status(400).json({
            error: "Error while unliking post",
            message: error.message,
        });
    }
}




exports.dummyLink = (req, res) => {
    res.send("Dummy Link is working!");
};

