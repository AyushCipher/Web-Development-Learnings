// import mongoose
const mongoose = require("mongoose");

// route handler
const likeSchema = new mongoose.Schema({
    post:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post", // refer to the id of post model
    },
    user: {
        type: String,
        required: true,
    },
});

// export 
module.exports = mongoose.model("like", likeSchema);