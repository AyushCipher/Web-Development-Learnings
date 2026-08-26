// JS involves two main phases while execution of any code :-


// Detailed Steps in Each Phase: [REFER b. indexExecution.png FOR MORE CLEARANCE]

// 1. Memory Allocation Phase
// 2. Code execution Phase


// MEMORY ALLOCATION PHASE:-

// Let's take this simple example once again:


// var n = 5;

// function square(n) {
//   var ans = n * n;
//   return ans;
// }

// var square1 = square(n);
// var square2 = square(8);  

// console.log(square1);
// console.log(square2);


// At the very beginning, the JavaScript engine executes the entire source code, creates a global execution context, and then does the following things:

// 1. Creates a global object that is window in the browser and global in NodeJs.
// 2. Sets up a memory for storing variables and functions.
// 3. Stores the variables with values as undefined and function references.
// 4. This is called the creation phase. 

// After this creation phase, the execution context will move to the code execution phase.


// EXECUTION PHASE:-

// Now, in this phase, it starts going through the entire code line by line from top to bottom. As soon as it encounters n = 5, it assigns the value 5 to 'n' in memory. 
// Until now, the value of 'n' was undefined by default.
// Then we get to the 'square' function. As the function has been allocated in memory, it directly jumps into the line var square1 = square(n);. 
// square() will be invoked and JavaScript once again will create a new function execution context.



// EXAMPLES:

// 1: WITH THE USE OF VAR:

    // console.log(a);  // undefined
    // var a = 'Ayush';


// 2: WITH THE USE OF FUNCTION: (see its's code execution in the b. functionExecution.png)

    // sayHi();

    // const username = 'Anurag';
    // const userAge = 25;

    // function sayHi() {
    // const a = 14;
    // const b = 12;
    // console.log(a, b);
    // addNo(7,9);
    // }

    // function addNo(x, y) {
    // return x + y;
    // }

    // console.log('Program Ended');












// IN DETAIL EXPLAINATION OF JS RUN TIME ENVIRONMENT:

// JavaScript is single-threaded, meaning it has one call stack. But the browser environment (not JS itself) provides:

// * Web APIs (setTimeout, DOM Events, fetch, etc.)
// * Callback Queue (for setTimeout, DOM events, etc.)
// * Microtask Queue (for Promises and MutationObservers)


// # CALL STACK:- 
// The Call Stack is a data structure that keeps track of the function calls in a program — it follows LIFO (Last In, First Out) principle.

// KEY REASONS WHY CALL STACK IS USED:
//      1. Function Execution Management: It keeps track of which function is currently running and what should run next.
//          * When a function is called, it's pushed onto the stack. 
//          * When it's done, it's popped off, and the control goes back to the previous function.

//      2. Error Tracking & Debugging: The stack helps generate stack traces (error messages that show the call path).

//      3. The Call Stack is essential for managing the order of function execution in JavaScript. 
//         Since JavaScript is single-threaded, the call stack ensures that only one function runs at a time, and functions are executed in the correct order.





// # WEB APIs:-
// These are interfaces provided by browsers (or web servers) that allow your JavaScript code to interact with the browser, external services, or devices — beyond the core JavaScript language
// When a function like setTimeout, addEventListener, or fetch is called:

// * It’s handled by the Web APIs in the browser.
// * Once done, they return a callback to either the Callback Queue or Microtask Queue.

// Examples:
// setTimeout → goes to Callback Queue after timeout.
// fetch → sends network request, returns response, goes to Microtask Queue.





// CALLBACK QUEUE:- (Can take only asynchronous functions)
// * Stores callbacks from setTimeout, setInterval, and DOM events.
// * Follows FIFO (First In, First Out).
// * Waits for the call stack to be empty before pushing to it.





// MICROTASK QUEUE:- (Can take only Promises and MutationObserver)
// * Stores Promise callbacks (.then, .catch, .finally) and MutationObservers.
// * Higher priority than the Callback Queue.
// * After the call stack is empty, all microtasks are processed before any callbacks in the callback queue.





// # EVENT LOOP: For better understanding refer- Philip Roberts Event Loop Youtube Video and use Loup software on google.

// FOR CODING PURPOSE:- Use Loup software on google

// Normally code in javascript is executed synchronously. In JavaScript, the event loop plays an important role in managing asynchronous operations and ensures the non-blocking behavior of the language.
// JavaScript is single-threaded, meaning it processes one task at a time and an event loop helps to handle asynchronous tasks efficiently.
// When an asynchronous operation, like a setTimeout callback or a user event, is initiated, it gets delegated to the browser’s APIs, allowing the main thread to remain unblocked.
// Once the operation is complete, a callback function is placed in the callback queue.

// The event loop continuously checks two main components: the call stack and the callback queue. The call stack keeps track of the currently executing function or task, 
// while the callback queue stores callback functions waiting to be processed. 
// If the call stack is empty, the event loop pushes all Microtasks from Microtask Queue and after its completion takes the first item from the callback queue and pushes it onto the call stack for execution.





// # HOISTING:

// Hoisting is a JavaScript mechanism where variable and function declarations are moved to the top of their scope (global or function scope) during the compilation (memory creation) phase — before the code is executed.
// JavaScript "hoists" declarations to the top of the code, so you can reference functions and variables before they are declared (with limitations).


// EXAMPLES:-

// console.log(a); // undefined
// var a = 10;



// console.log(b); // ❌ ReferenceError - In case of variable defined with const/let, b is in the Temporal Dead Zone from the start of the block until the declaration is encountered.
// let b = 5; 




// FUNCTION DECLARATION:

// greet(); // ✅ Works and prints Hello since Function can be Hoisted

// function greet() {
//   console.log("Hello!");
// }






// FUNCTION EXPRESSION:

// sayHi(); // ❌ TypeError: sayHi is not a function because sayHi variable has undefined value initially and if we call a undefined value oit gives error

// var sayHi = function () {
//   console.log("Hi!");
// };

// Therefore, Function Expression cannot be Hoisted








// LEXICAL ENVIRONMENT:-  The lexical environment is basically data structure keeps the variable and their value reference in memory so that it can easily find it for execution context.
// It is the local memory along with the lexical environment of its parent. Lexical means in heirarchy or in order. 
// Whenever an execution context is created , lexical environment is also created side-by-side.


// A Lexical Environment is a structure that holds:
// The current local memory (variable/function declarations) and a reference to the outer environment (parent scope).

// EXAMPLE:

// function outer() {
//   let a = 10;

//   function inner() {
//     console.log(a); // `inner` has access to `outer`'s lexical environment
//   }

//   inner();
// }
// outer();






// SCOPE CHAIN:- The process of going one by one to the parent and checking for values is called the scope chain or lexical environment chain. It's like a treasure hunt through your code hierarchy. 
// Whenever an execution context is created, a lexical environment(LE) is also created and is referenced in the lexical execution context(in memory space) of parent.



// A scope chain is the chain of lexical environments used to resolve variables. JS starts searching in the current scope, then goes to parent, then global, and so on.

// EXAMPLE:

// let a = "global";

// function outer() {
//   let b = "outer";

//   function inner() {
//     let c = "inner";
//     console.log(a); // global → outer → inner (scope chain)
//     console.log(b); // outer
//     console.log(c); // inner
//   }

//   inner();
// }
// outer();






// PRACTICE CODES:-

// function two(){
//   console.log(a);
// }
// function one(){
//   var a=2;
//   console.log(a);
//   two();
// }
// var a=1;
// console.log(a);
// one();


// RESULT: Output for the above code is 1 2 1 because two() does not have its own variable a, so it looks for a in the outer scope,
// but its outer scope is the global scope, because two() was defined globally (not inside one()).




// function two(){
//     var a;
//     console.log(a);
//   }
//   function one(){
//     var a=2;
//     console.log(a);
//     two();
//   }
//   var a=1;
//   console.log(a);
//   one();


// RESULT: Output for the above code is 1 2 undefined because we have not given any value to variable a in function two and in javascript default value assigned to a variable is undefined.









// # CLOSURES:- A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment) or it is a bundel of functions along with a lexical scope.
// In other words, a closure gives you access to an outer function's scope from an inner function. 
// A closure is formed when a function "remembers" its lexical environment even when it's executed outside of its original scope.
// In JavaScript, closures are created every time a function is created, at function creation time.

// Uses of Closures:
// - Module Design Pattern
// - Currying
// - Functions like once
// - memoize
// - maintaining state in async world
// - setTimeouts
// - Iterators
// - and many more... 

 
// function outerFunction() {
//     let outerFuncVar = "outside";
//     function innerFunction() {
//       console.log(`The value is: ${outerFuncVar}`);
//     }
//     return innerFunction();
//   }
  
//   outerFunction();



                      
// REAL LIFE USAGE OF CLOSURES EXAMPLES:

/* <body>

  <button id="orange">Orange</button>
  <button id="green">Green</button>

  <script>
    function clickHandler(color) {
      // `color` is captured in the closure
      return function () {
        document.body.style.backgroundColor = color;
      };
    }

    document.getElementById('orange').onclick = clickHandler("orange");
    document.getElementById('green').onclick = clickHandler("green");
  </script>

</body> */



// function outer() {
//   let count = 0;

//   return function inner() {
//     count++;
//     console.log("Count:", count);
//   };
// }

// const counter = outer();
// counter(); // Count: 1
// counter(); // Count: 2

// SCENARIO:- If closures didn’t exist - count would be destroyed after outer() finishes. inner() wouldn't have access to it.
// So counter() wouldn’t remember previous count values — it would throw an error or restart from 0.

// outer() is called and it returns the inner() function. Even though outer() has finished executing, 
// the inner() function (which is now assigned to counter) still remembers the variable count that was defined inside outer().
//This is possible because of closure.




// EXAMPLE:-
// function makeFunc() {
//     const name = "Mozilla";
//     function displayName() {
//       console.log(name);
//     }
//     return displayName;
//   }
  
//   const myFunc = makeFunc();
//   myFunc();

// SCNEARIO:- makeFunc() is called and returns the displayName function.Even though makeFunc() has finished execution, 
// myFunc() (which is displayName) still remembers and accesses the variable name defined inside makeFunc().
// Therefore, a closure gives you access to an outer function’s variables even after the outer function has returned.




// EXAMPLE:-
// function x(){
//     var a= 7;
//     function y() {
//     console.log(a);
//     }
//     return y;
// }
// var z = x();
// console.log(z);

//  ........    (Assume that many lines of codes are written in between)
// z();

//        OR [BOTH ABOVE AND BELOW CODE IS SAME]

// function x(){
//     var a= 7;
//     return function y() {
//     console.log(a);
//     }
// }
// var z = x();
// console.log(z);

//  ........    (Assume that many lines of codes are written in between)
// z();




// RESULT:- 7 ,bcoz even if x doesn't exist anymore but it still remembers reference to a.




function z() {
    var b= 900;
    function x() {
        var a= 7;
        function y(){
            console.log(a,b);
        }
        y();
    }
    x();
}
z();



// RESULT:- a=7 , b=900 




// Interview Question for setback function:-

// I want to print 1 after 1 second, then 2 after 2 sec, then 3 after 3 sec , then 4 after 4 sec and then 5 after 5 sec, thus funciton can be created as :-

// function x() {
//     for (var i = 1; i <= 5; i++) {          // This is a for loop that iterates from 1 to 5. The variable i is declared using var, which means it has function scope (not block scope).
//       setTimeout(function () {
//         console.log(i);
//       }, i * 1000);
//     }
//     console.log("Namaste JavaScript");
//   }
//   x();



// RESULT:- In this code, the var keyword declares i with function scope. This means that when the setTimeout callbacks execute, they all reference the same i variable, which has already been incremented to 6 by the time the callbacks are invoked. 
// As a result, you see the number 6 printed five times.



// function x() {
//     for (let i = 1; i <= 5; i++) {
//       setTimeout(function () {
//         console.log(i);
//       }, i * 1000);
//     }
//     console.log("Namaste JavaScript");
//   }
//   x();


// RESULT:- In this code, the let keyword declares i with block scope. Each iteration of the loop creates a new block-scoped i variable. 
// As a result, each setTimeout callback references a different i value, preserving the correct value of i at each iteration.
  

// WHAT IF INTERVIEWER ASKS TO DO THE SAME WITH VAR:

// function x() {
//     for (var i = 1; i <= 5; i++) {
//       (function(i) {
//         setTimeout(function () {
//           console.log(i);
//         }, i * 1000);
//       })(i);
//     }
//     console.log("Namaste JavaScript");
//   }
//   x();


// RESULT:- 
// How It Works:
// * The for loop runs 5 times, from i = 1 to i = 5.
// * Each time the loop runs, the IIFE is invoked with the current value of i.
// * The IIFE creates a new scope where the current value of i is captured and used inside the setTimeout.
// * The setTimeout schedules a log of the current i value after i * 1000 milliseconds.
// * Due to the IIFE, each setTimeout callback retains the correct value of i for that iteration.
// * The message "Namaste JavaScript" is logged immediately after the loop finishes setting up the timeouts.


  
  


