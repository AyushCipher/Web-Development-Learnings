// import the model
const Todo = require("../models/Todo");

// define route handler

// async function is used bcz we dont want database interaction to be done 
// at main thread which could affect the main code flow
exports.createTodo = async(req,res) => {
    try{
        // extract title and description from reusable body
        const {title, description} = req.body;
        // create a new Todo Object and insert it into database
        const response = await Todo.create({title, description});
        // send a JSON response with a success flag
        res.status(200).json({
            success: true,
            data: response,
            message: "Entry Created Successfully"
        });
          
    }
    catch(err){
        console.error(err);
        console.log(err);
        res.status(500) // Internal Server error
        .json({
            success:false,
            data: "Internal Server error",
            message: err.message,
        })
    }
}