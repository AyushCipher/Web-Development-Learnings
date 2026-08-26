// import the model
const Todo = require("../models/Todo");

// define route handler

exports.getTodo = async(req,res) => {
    try{
        // fetch all todo items from database
        const todos = await Todo.find({});

        // response 
        res.status(200)
        .json({
            success: true,
            data: todos,
            message: "Entire Todo Data is fetched",
        })
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

exports.getTodoById = async(req,res) => {
    try{
        // extract todo items based on ID
        const id = req.params.id;
        const todo = await Todo.findById( {_id: id});
        
        // error if data for given id not found
        if(!todo) {
            return res.status(404).json({
                success:false,
                message: "No Data Found with given ID.",
            })
        }
        // data for given id is found 
        else {
            return res.status(200).json({
                success: true,
                message: `Todo ${id} data successfully fetched.`,
                data: todo,
            })
        }

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