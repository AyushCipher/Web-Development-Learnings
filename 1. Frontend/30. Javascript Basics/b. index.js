console.log('Namaste Dunia version 42');


// Q. WHAT IS CLIENT-SIDE SCRIPTING?

// Client-side scripting refers to code that is executed on the user's browser rather than on the web server. 
// It enables interactive web pages by responding to user actions without requiring a page reload.


// # KEY FEATURES of Client-Side Scripting:
// * Runs on the Browser – Executes on the client’s machine, reducing server load.
// * Enhances Interactivity – Enables dynamic updates, form validation, animations, and more.
// * Faster Response Time – No need to wait for a server request for every action.
// * Works with HTML & CSS – Manipulates web page structure and styling dynamically.


// How Client-Side Scripting Works?
// 1. User requests a web page → The browser loads HTML, CSS, and JavaScript.
// 2. JavaScript executes in the browser → Manipulates the DOM (Document Object Model).
// 3. Responds to user interactions like button clicks, mouse movements, or form submissions.


// # Limitations of Client-Side Scripting
// * Security Risks – Code is visible to users and can be manipulated.
// * Browser Compatibility – Some scripts may not work in all browsers.
// * Performance Issues – Heavy scripts may slow down the browser.





// Q. WHAT IS SERVER-SIDE SCRIPTING?

// Server-side scripting refers to code that is executed on the web server before the content is sent to the user's browser.
// It handles backend operations like database interactions, authentication, and dynamic content generation.


// # KEY FEATURES of Server-Side Scripting:
// * Runs on the Server – Executes on the web server, hidden from users.
// * Dynamic Content – Generates HTML based on user input, sessions, or database queries.
// * Secure Processing – Keeps sensitive logic and data secured on the server.
// * Integrates with Databases – Easily connects with MySQL, MongoDB, etc., for data-driven applications.


// How Server-Side Scripting Works?
// 1. User requests a web page → Request is sent to the server.
// 2. Server executes the script (e.g., PHP, Python) → Processes data, interacts with databases.
// 3. Server sends the generated HTML → Browser renders the final output for the user.


// # Limitations of Server-Side Scripting
// * Slower Response Time – Requires communication with the server for each request.
// * Server Load – More users mean higher demand on server resources.
// * Requires Internet – Cannot function offline since it depends on server connection.





// Note:- let and var both can be used to declare a variable but both of them differ in terms of scope.

// 1. SCOPE:- let is block-scoped, meaning it is only accessible within the block {} in which it is defined whereas
// var is function-scoped, meaning it is accessible throughout the function where it is declared, even outside blocks like if, for, etc.

function testScope() {
  if (true) {
    var a = 10;
    let b = 20;
  }
  console.log(a); // ✅ Works (function-scoped)
  console.log(b); // ❌ ReferenceError: b is not defined
}


// 2. REDECLARATION: let can not be used to re-declare a variable in same scope but var can be used to redeclare a variable in same scope.

// let x = 5;
// let x = 10; // ❌ SyntaxError: Identifier 'x' has already been declared

var y = 5;
var y = 10; // ✅ No error


// 3. HOISTING: var is hoisted and initialized to undefined, while let is hoisted but not initialized, leading to a ReferenceError(TDZ) if accessed before declaration.

console.log(a); // undefined
var m = 10;

console.log(b); // ❌ ReferenceError
let n = 20;


// TEMPORAL DEAD ZONE(TDZ):- It is a specific period in the execution of JavaScript code where variables declared with let and const exist/initialized
// but cannot be accessed or assigned any value. During this phase, accessing or using the variable will result in a ReferenceError called the TEMPORAL DEAD ZONE.





// Const is a keyword used to declare a variable which has a constant value throughout the code and cannot be changed.

const num = 12;
num = 13;       // --> Gives assignment error



// Javascript is a dynamically typed language, i.e, if we declare a variable in string value it can be re-initialized with an integer value that is not possible in C++/Java.
let lastName = 'Ayush';
console.log(lastName);

lastName = 3;
console.log(lastName);



// Equality operator:- 

// 1.Loose equality(==)  
// 2.Strict equality(===)

// For loose equality, only values must be same but for strict equality values along with datatype must be equal/same.

// let num=1;
// let str='1';
// (num==str)  ---> It will give true bcz values are same so not satisfies equality condition and datatype is not given importance for checking here.

// let num=1;
// let str='1';
// (num===str)  ---> It will give false bcz datatypes are different so not satisfies strict equality condition.
 



// CONCEPT OF TRUTHY AND FALSY IN JS:-

// A truthy value is one that is considered true when evaluated in a boolean context.
// A falsy value is one that is considered false when evaluated in a boolean context.

// JavaScript has the following falsy values:

// 1. false
// 2. 0
// 3. "" (empty string)
// 4. null
// 5. undefined
// 6. NaN


// EXAMPLE:-

// let truthyValue = "Hello, World!";
// let falsyValue = "";


// AND (&&) examples:
// let andExample1 = truthyValue && "Another truthy value";
// let andExample2 = falsyValue && "Won't be evaluated";
// let andExample3 = truthyValue && falsyValue;

// console.log(andExample1); // "Another truthy value"   --->   If both values are truthy, it returns the second value.
// console.log(andExample2); // ""
// console.log(andExample3); // ""



// OR (||) examples:
// let orExample1 = truthyValue || "Won't be evaluated";
// let orExample2 = falsyValue || "A truthy value";
// let orExample3 = falsyValue || 0 || null || "Finally a truthy value";

// console.log(orExample1); // "Hello, World!"
// console.log(orExample2); // "A truthy value"
// console.log(orExample3); // "Finally a truthy value"




// TERNARY OPERATOR:
let age = 17;
let status = (age>=18)? 'Yes, I can vote.': 'No, I cannot vote.';
console.log(status);

// RESULT: No, I cannot vote.
// Strike on status is due to :- status was a property of the global Window object in browsers.
// If running JavaScript in a browser environment (like Chrome DevTools or VS Code’s live server), it might conflict with window.status, which is deprecated.

// Deprecated Feature: A deprecated feature is something that -+ is still available but no longer recommended for use because it may be removed in future updates.
// Sometimes, editors use a strikethrough to highlight code that uses such features or methods.
// When you see a strikethrough on a variable, VS Code knows that it is deprecated.



let age1 = 17;
let status1 = (age1 === 62) ? 'No, voting is not possible.' : (age1 >= 18) ? 'Yes, I can vote.' : 'No, I cannot vote.';
console.log(`Age: ${age1}, Status: ${status1}`);

// RESULT: Age: 17, Status: No, I cannot vote.



const result = 10 ? 'Ayush': 'Verma'? '12': 0;
console.log(result);

// RESULT: Ayush
// 10 is a truthy value. The ternary operator evaluates the condition 10 ? 'Ayush' : 'Verma'.
// Since 10 is truthy, 'Ayush' is assigned to result


const result1 = null ? 'Ayush': ''? '12': 0;
console.log(result1);

//RESULT: 0
// Since null is falsy, it evaluates to '' ? '12' : 0.
// '' (an empty string) is also falsy. Since '' is falsy, it evaluates to 0. Thus, 0 is assigned to result1.





// # IMPORTANT NOTE:-

// 1. '100' is a string we all know but if we want to convert it into a number then just add a + sign before it..
//    + '100' on writing this in console, JS thinks that we want to add this string into a number hence it starts to treat '100' as a number.

// PARSE INT:- parseInt is a built-in JavaScript function that parses a string argument and returns an integer of the specified radix (base). 
// SYNTAX:     parseInt(string, radix);


// 2. If we write + '100ayush' then it will give NaN (NOT A NUMBER) as output but
//    if we write parseInt('100adfdf') in console, it will give 100 as output meaning it parses until a non-numeric character is found but
//    if we write parseInt('rth100adfdf') in console, it will give NaN as output since first character is not a number.


// let binaryStr = "1010";
// let num = parseInt(binaryStr, 2); // binary base
// console.log(num);

// Output: 10


// 3. To convert a number into string just add + '' before/after the number
//    Eg: 100 +'' => '100'
//       'asassas' + 100 => 'asassas100'




// # NOTE:-

// The languages which are C, Java, JavaScript, Python and Ruby are just some languages using the Static Scope. 
// On the other hand, Perl is an example for a language using the dynamic scoping.

// The key difference between static and dynamic scope is pretty straightforward. When resolving, static scope cares the where the variable is declared physically. That environment matters for static scope. 
// On the other hand, dynamic scope cares the where the function/caller is invoked, so the revolving actually is not static, it depend on where I invoke not the function itself.



// Static Scope (Lexical Scope):

// A variable is found based on where it was declared in the code — not where the function is called from.

// EXAMPLE:

// let x = 10;

// function foo() {
//   console.log(x); // uses outer x (10)
// }

// function bar() {
//   let x = 20;
//   foo(); // still prints 10
// }

// bar();



// Dynamic Scope:

// A variable is found based on where the function is called from, not where it's written.

// EXAMPLE:

// $x = 10;

// sub foo {
//   print $x;          # uses caller's x
// }

// sub bar {
//   local $x = 20;
//   foo();             # prints 20, because foo is called from bar
// }

// bar();





// SCOPE DIFFERENCE BETWEEN VAR, LET AND CONST:

// 1. Scope: var is function-scoped, while let and const are block-scoped.
// 2. Hoisting: var is hoisted and initialized with undefined, while let and const are hoisted but not initialized, leading to a ReferenceError if accessed before declaration.
// 3. Re-declaration: var can be re-declared, but let and const cannot.
// 4. Immutability: const variables cannot be reassigned, although objects and arrays declared with const can have their contents modified.







// JS involves two main phases while execution of any code :-


// Detailed Steps in Each Phase: [REFER b. indexExecution.png FOR MORE CLEARANCE]

// 1. Memory Allocation Phase
// 2. Code execution Phase


// MEMORY ALLOCATION PHASE:-

// Let's take this simple example once again:


var number = 5;

function square(number) {
  var ans = number * number;
  return ans;
}

var square1 = square(number);
var square2 = square(8);  

console.log(square1);
console.log(square2);


// At the very beginning, the JavaScript engine executes the entire source code, creates a global execution context, and then does the following things:

// 1. Creates a global object that is window in the browser and global in NodeJs.
// 2. Sets up a memory for storing variables and functions.
// 3. Stores the variables with values as undefined and function references.
// 4. This is called the creation phase. 

// After this creation phase, the execution context will move to the code execution phase.


// EXECUTION PHASE:--

// Now, in this phase, it starts going through the entire code line by line from top to bottom.
// As soon as it encounters number = 5, it assigns the value 5 to 'number' in memory. 
// Until now, the value of 'number' was undefined by default.
// Then we get to the 'square' function. As the function has been allocated in memory, it directly jumps into the line var square1 = square(number);. 
// square() will be invoked and JavaScript once again will create a new function execution context.



// EXAMPLES:

// 1: WITH THE USE OF VAR:

console.log(a);  // undefined
var a = 'Ayush';


// 2: WITH THE USE OF FUNCTION: (see its's code execution in the b. indexFuncExecution.png)

sayHi();

const username = 'Anurag';
const userAge = 25;

function sayHi() {
    const a = 14;
    const b = 12;
    console.log(a, b);
    addNo(7,9);
}

function addNo(x, y) {
    return x + y;
}

console.log('Program Ended');








