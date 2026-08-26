"use strict";           // to observe strict mode behavior



// 1. this IN GLOBAL CONTEXT

console.log(this);      // window object(or global), since it's the top-level context





// 2. this IN A FUNCTION:

function x() {
  console.log(this);
}
x();                    // Logs: undefined (no this substitution in strict mode)



function x() {
  console.log(this);
}
window.x = x;
window.x();             // Logs: window, because now x is being called as a method of the window object




// 3. this in an OBJECT METHOD:- this refers to the object calling the method.

const obj = {
    name: "Javascript",
    show: function() {
        console.log(this.name);
    }
};
obj.show();             // Logs: Javascript





// 5. this INSIDE ARROW FUNCTION

const object = {
    name: "Arrow",
    show: function () {
        const arrowFunc = () => {
            console.log(this.name);
        };
        arrowFunc();
    }
};
obj.show(); // Logs: Arrow





const btn1 = document.getElementById("btn1");
const btn2 = document.getElementById("btn2");
const btn3 = document.getElementById("btn3");
const btn4 = document.getElementById("btn4");

// Normal function (this = button element)
btn1.addEventListener("click", function () {
  console.log("btn1 this (normal function):", this);    // this => <button>
});


// Arrow function (this = lexical parent, i.e., window or undefined in strict mode)
btn2.addEventListener("click", () => {
  console.log("btn2 this (arrow function):", this);     // this => undefined (strict mode)
});


// bind() to fix `this` to custom object
const obj1 = {
  name: "BoundObject",
  show: function () {
    console.log("btn3 this (bound):", this.name);
  }
};
btn3.addEventListener("click", obj.show.bind(obj1));    // Logs: BoundObject


// call() used to invoke function with specific `this`
function showWithCall() {
  console.log("btn4 this (called with call):", this.name);
}
const anotherObj = { name: "CalledObject" };
btn4.addEventListener("click", function () {
  showWithCall.call(anotherObj);                        // Logs: CalledObject
});




// Button ID	        Function Type	                this refers to
// btn1	                Normal function	                The <button> DOM element
// btn2	                Arrow function	                Lexical this (global/undefined)
// btn3	                Bound function	                Custom object obj
// btn4	                .call() usage	                Custom object anotherObj
