//  1. this in Global Context:

console.log(this);          // window (in browser), global (in Node.js)




// 2. this in a Function (Not a Method):

function x() {
    console.log(this);
}
x();                        // Logs: window object(in browsers), because of `this` substitution



