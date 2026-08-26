// import the model
const Todo = require("../models/Todo");

// define route handler

exports.updateTodo = async(req,res) => {
    try{
        const {id} = req.params;
        const {title, description} = req.body;

        // { new: true } is required here - without it, findByIdAndUpdate
        // resolves to the document as it looked BEFORE the update, so the
        // response below would echo back the caller's own stale title/
        // description instead of confirming what was actually saved.
        const todo = await Todo.findByIdAndUpdate(
            {_id: id},
            {title, description, updatedAt: Date.now(),},
            {new: true},
        )
        if (!todo) {
            return res.status(404).json({
              success: false,
              message: "Todo not found.",
            });
        }
      
        // Respond with the updated todo
        res.status(200).json({
        success: true,
        data: todo,
        message: "Updated Successfully",
        });
    } 
    catch (err) {
        console.error(err);
        res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message,
        });
    }
};