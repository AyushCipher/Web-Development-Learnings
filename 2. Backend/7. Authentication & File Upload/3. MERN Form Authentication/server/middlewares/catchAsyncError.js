const catchAsyncError = (theFunction) => {
    return(req, res, next) => {
        Promise.resolve(theFunction(req, res, next)).catch(next);
    }
}


module.exports = { catchAsyncError };

// It creates a universal wrapper for any asynchronous function (like controller functions) so that:

// * We don’t need to write try-catch blocks in every async function.
// * It automatically forwards errors to Express’s error handler via next().

