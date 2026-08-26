// import mongoose
const mongoose = require("mongoose");
  
// route handler
const todoSchema = new mongoose.Schema(
    {
        title:{
            type: String,
            required: true,
            maxLength: 50,
        },
        description:{
            type: String,
            required: true,
            maxLength: 50,
        },
        // createdAt: {
        //     type: Date,
        //     required: true,
        //     maxLength: Date.now(),
        // },
        // updatedAt: {
        //     type: Date,
        //     required: true,
        //     maxLength: Date.now(),
        // }
    },
    { timestamps: true } // Automatically adds `createdAt` and `updatedAt`
);

// export
module.exports = mongoose.model("Todo", todoSchema);