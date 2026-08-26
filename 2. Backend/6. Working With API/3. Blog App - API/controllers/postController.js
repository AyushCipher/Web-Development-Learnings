// import 
const Post = require("../models/postModal1");

exports.createPost = async(req, res) => {
    // .create alternate method for creation 
        try{
            // fetch data from req body
            const {title, body} = req.body;
            // create a Post object
            const post = new Post({
                title, body
            });
    
            // Save the new Post into the database
            const savedPost = await post.save();

            res.json({
                post: savedPost, // is an Express method used to send a JSON-formatted response to the client.
            })
        }
    catch(error) {
        return res.status(400).json({
            error: "Error while creating post",
        });
    }
};

// need some more testing after adding completing like wla controller
exports.getAllPosts = async (req, res) => {
    try{
        // .populate() replaces the stored ObjectId references with the
        // actual referenced documents - both "likes" and "comments" need
        // their own populate() call, since populating one doesn't affect
        // the other.
        const posts = await Post.find().populate("likes").populate("comments").exec();
 
        res.json({
            posts,
        })
    }   

    catch(error) {
        return res.status(400).json({
            error: "Error while creating post",
        });
    }
}