// Performance in the DOM refers to how efficiently your JavaScript code interacts with the Document Object Model (DOM) when creating, updating, or deleting elements. 

// adding 100 para
const t1 = performance.now();
for(let i=1; i<=100; i++){
    let newElement = document.createElement('p');
    newElement.textContent = 'This is Para' + i;

    document.body.appendChild(newElement);
}

const t2 = performance.now();
console.log("This took "+ (t2-t1) + "ms");



// Optimizing a little bit
const t3 = performance.now();
let myDiv = document.createElement('div');

for(let i=1; i<=100; i++){
    let element = document.createElement('p');
    element.textContent = 'This is Para' + i;

    myDiv.appendChild(element);
}

document.body.appendChild(myDiv);
const t4 = performance.now();
console.log("This took "+ (t4-t3) + "ms");

// # REASON:- The differences in execution time of both the codes is due to Reflow and Repaint.
// Reflow means re-calculating the positions and geometries of elements in the document. 
// The Reflow happens when changes are made to the elements, that affect the layout of the partial or whole page. 
// The Reflow of the element will cause the subsequent reflow of all the child and ancestor elements in the DOM.
// Reflows are very expensive in terms of performance, and is one of the main causes of slow DOM scripts, especially on devices with low
// processing power, such as phones. In many cases, they are equivalent to laying out the entire page again.

// The Repaint occurs when changes are made to the appearance of the elements that change the visibility, but doesn't affect the layout
// Eg: Visibility, background color, outline


 




// # CONCEPT OF CALL STACK:-

// JavaScript is a popular single-threaded programming language commonly used for web development. In web browsers, JavaScript runs in the main thread and handles tasks like user interactions, DOM manipulation, and HTTP requests. 
// While it is single-threaded, JavaScript leverages non-blocking I/O and asynchronous programming to handle tasks efficiently, enabling responsive and interactive web applications.
// In a multi-threaded language, the code can run multiple tasks at the same time, making it faster and more efficient for handling complex tasks.

// JavaScript uses a Call Stack to track the functions in a program. The call stack works on the Last In, First Out (LIFO) principle. This means that the most recently called function will be the first to be completed. 
// Whenever a function is called, a new frame is added to the top of the stack. Similarly, when the function has completed its execution, its frame is removed from the stack. JavaScript Engine uses Call Stack to track all the functions.






// # EVENT LOOP: For better understanding refer- Philip Roberts Event Loop Youtube Video and use Loup software on google

// FOR CODING PURPOSE:- Use Loup software on google

// Normally code in javascript is executed synchronously. In JavaScript, the event loop plays an important role in managing asynchronous operations and ensures the non-blocking behavior of the language.
// JavaScript is single-threaded, meaning it processes one task at a time and an event loop helps to handle asynchronous tasks efficiently.
// When an asynchronous operation, like a setTimeout callback or a user event, is initiated, it gets delegated to the browser’s APIs, allowing the main thread to remain unblocked.
// Once the operation is complete, a callback function is placed in the callback queue.

// The event loop continuously checks two main components: the call stack and the callback queue. The call stack keeps track of the currently executing function or task, while the callback queue stores callback functions waiting to be processed. 
// If the call stack is empty, the event loop takes the first callback from the queue and pushes it onto the call stack for execution.





// # setTimeout method():-

// The setTimeout() method calls a function after a number of milliseconds, meaning if you have set a time, eg: 4 seconds then minimum after 4 seconds the function would be sent to call stack. 
// Maximum timing for asynchronous function to be sent on call stack depends on when call stack would be empty.
// 1 second = 1000 milliseconds.
// The setTimeout() is executed only once. If you need repeated executions, use setInterval() instead.

// EXAMPLE:

// function greetOnce() {
//   console.log("Hello! This runs only once after 2 seconds.");
// }

// setTimeout(greetOnce, 2000); // Waits 2 seconds, then runs once

// clearTimeout(timeoutId); // This will prevent greetOnce from running





// # setInterval method():-

// setInterval() is a JavaScript function that repeatedly executes a specified function at fixed time intervals, until it is cleared.

// EXAMPLE:

// function greetRepeatedly() {
//   console.log("Hi! This runs every 1 second.");
// }

// const intervalId = setInterval(greetRepeatedly, 1000); // Runs every 1 second

// // Optional: Stop after 5 seconds
// setTimeout(() => {
//   clearInterval(intervalId);
//   console.log("Stopped the interval.");
// }, 5000);





// The main difference between setTimeout and setInterval is that setTimeout executes the code only once after the specified delay, 
// while setInterval executes the code repeatedly at the specified interval.






// Benefits Of Asynchronous Programming:-

// The advantages of using this parallel programming technique include: 1. Clean And Concise , 2. Better Error Handling, 3.Easier Bugging;

// 1. Using async programming enhances speed, responsiveness and user experience.
// 2. By eliminating page load delays, subsequent page refreshes are no longer necessary.
// 3. You can use over one feature at a time, even if other requests are running.
// 4. An asynchronous application requires few resources and is highly scalable.
// 5. The response time of one request does not affect the response time of others.
// 6. When one thread fails, the others continue to render.
// 7. A built-in callback lets you create custom error messages.

// Example:-
// setTimeout(function() {
//     console.log('third');
//     },3000)
//     function sync() {
//     console.log('first');
//     }
//     sync();
//     console.log('second');

// RESULT:- first
//          second
//          third








