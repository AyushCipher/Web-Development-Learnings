// EVENT LOOP:- The Event Loop in Node.js is a mechanism that continuously monitors the call stack and callback queues, 
// and moves asynchronous callbacks into the call stack for execution when the stack becomes empty.

// WHY IS IT NEEDED?
// ANS- The Event Loop is needed in Node.js because JavaScript is single-threaded and can execute only one operation at a time, but applications still need to handle asynchronous tasks like
//  timers, file reading, database queries, API requests, and network operations without blocking the entire program. 
//  The event loop enables non-blocking asynchronous execution by continuously monitoring the call stack and callback queues, and executing completed async callbacks only when the stack becomes empty. 
//  This allows Node.js to efficiently handle thousands of concurrent operations using a single main thread without freezing the application.


// ORDER OF EXECUTION:

// Call Stack
//    ↓
// Web APIs / Node APIs
//    ↓
// Queues
//    ├── Microtask Queue
//    └── Macrotask Queue
//    ↓
// Event Loop
//    ↓
// Back to Call Stack


// MACROTASKS (Task Queue): 
// Macrotasks are normal asynchronous tasks that are scheduled to run in future iterations of the event loop.
// These tasks are placed in the macrotask queue (also called the callback queue or task queue) after their asynchronous operation completes.
// It has lower priority than microtasks and only one macrotask executes per event loop iteration. 
// Macrotasks are generally used for operations that do not need immediate execution and can wait for the next cycle of the event loop.
// Before moving to the next macrotask, JavaScript first checks whether any microtasks are pending. If microtasks exist, all of them are executed first.
// EXAMPLES: setTimeout(), setInterval(), setImmediate() in Node.js, I/O callbacks(fs.readFile), UI rendering tasks in browsers (click, scroll, keypress).


// MICROTASKS (Microtask Queue):
// Microtasks are high-priority asynchronous tasks that execute immediately after the current synchronous code finishes execution and before the event loop proceeds to the next macrotask.
// Microtasks are designed for operations that should execute as soon as possible after the current operation completes.
// EXAMPLES: Promise callbacks(Promise.then(), Promise.catch(), Promise.finally()), process.nextTick() in Node.js, MutationObserver callbacks in browsers, queueMicrotask() in browsers and Node.js.



const fs = require("fs");
const crypto = require("crypto");

console.log("1. script start");

setTimeout(() => {
  console.log("2. settimeout 0s callback (macrotask)");
}, 0);

setTimeout(() => {
  console.log("3. settimeout 0s callback (macrotask)");
}, 0);

setImmediate(() => {
  console.log("4. setImmediate callback (check)");
});

Promise.resolve().then(() => {
  console.log("5. Promise resolved (microtask)");
});

// This has EVEN HIGHER priority than Promise microtasks in Node.js.
process.nextTick(() => {
  console.log("6. process.nexttick callback (microtask)");
});

fs.readFile(__filename, () => {
  console.log("7. file read operation (I/O callback)");
});

crypto.pbkdf2("secret", "salt", 10000, 64, "sha512", (err, key) => {
  if (err) throw err;
  console.log("8. pbkdf2 operation completed (CPU intensive task)");
});

console.log("9. script ends");

// Full Event Loop Flow
// 1. timers
// 2. pending callbacks
// 3. idle/prepare
// 4. poll
// 5. check
// 6. close callbacks

// Each phase has its own queue.


// OUTPUT:
// 1. script start
// 9. script ends
// 6. process.nexttick callback (microtask)
// 5. Promise resolved (microtask)
// 2. settimeout 0s callback (macrotask)
// 3. settimeout 0s callback (macrotask)
// 4. setImmediate callback (check)
// 7. file read operation (I/O callback)
// 8. pbkdf2 operation completed (CPU intensive task)



