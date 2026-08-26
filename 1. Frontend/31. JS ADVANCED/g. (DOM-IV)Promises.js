//# CALLBACK FUNCTION: A callback is a function passed as an argument to another function, and it is executed after the completion of that function.

// ADVANTAGES:
// *  Simple to Use - Easy to implement in basic asynchronous tasks.
// * Control over Execution - Callbacks give explicit control over what should happen after an operation.
// * Flexible - Commonly used in many APIs. Can pass any function as a callback and reuse it in different situations.


// DISADVANTAGES:
// * Callback Hell - Nesting callbacks leads to deeply indented, unreadable code, known as callback hell.
// * Difficult to Manage Errors - Handling errors across nested callbacks is messy and inconsistent.
// * Inversion of Control - The main function hands over control to the callback, which may not behave as expected. (SOMETIMES MAY CALL NOT CALL THE CALLBACK FUNCTION 
// SINCE BUSY SOMWEHERE ELSE OR IT MAY CALL IT SEVERAL TIMES RATHER THAN ONCE)


// EXAMPLE:

// function fetchData(callback) {
//   setTimeout(() => {
//     console.log("Data fetched");
//     callback();
//   }, 1000);                          
// }

// function processData() {
//   console.log("Data processed");
// }                                                                    

// fetchData(processData);   

// RESULT:
// Data fetched
// Data processed








// CALLBACK HELL (Pyramid of Doom): Callback Hell happens when callbacks are nested within callbacks, 
// leading to hard-to-read and hard-to-maintain code — known as the Pyramid of Doom.

// setTimeout(() => {
//   console.log("Step 1: Fetch user");

//   setTimeout(() => {
//     console.log("Step 2: Get user posts");

//     setTimeout(() => {
//       console.log("Step 3: Show post details");
//     }, 1000);

//   }, 1000);

// }, 1000);






// USING PROMISES TO AVOID CALLBACK HELL:

// EXAMPLE:

// function fetchUser() {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       console.log("Step 1: Fetch user");
//       resolve();
//     }, 1000);
//   });
// }

// function getPosts() {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       console.log("Step 2: Get user posts");
//       resolve();
//     }, 1000);
//   });
// }

// function showPostDetails() {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       console.log("Step 3: Show post details");
//       resolve();
//     }, 1000);
//   });
// }

// function getResponse() {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       console.log("Step 4: Details are valid");
//       reject("Something went wrong in getting response!");
//     }, 1000);
//   });
// }

// // Promise chaining
// fetchUser()
//   .then(getPosts)
//   .then(showPostDetails)
//   .then(getResponse)  // pass the function, don’t call it
//   .catch((err) => console.log("Error:", err));



















// # PROMISES:

// The Promise object represents the eventual completion (or failure) of an asynchronous operation and its resulting value.
// After the promise is resolved we can pass it anywhere we want, because it is immutable we do not need to worry value inside the object. 

// A Promise is a proxy for a value not necessarily known when the promise is created. 
// It allows you to associate handlers with an asynchronous action's eventual success value or failure reason. 
// This lets asynchronous methods return values like synchronous methods: instead of immediately 
// returning the final value, the asynchronous method returns a promise to supply the value at some point in the future.




// USECASES OF PROMISES:-

// 1. Avoid Callback Hell (Pyramid of Doom): Nested callbacks become hard to read and maintain.
// 2. Improved Error Handling: With promises, .catch() handles errors from any stage in the chain.
// 3. Promise States Offer Control - pending, fulfilled, rejected.
// 4. Return Values in Async Code: In callback style, you can't "return" a value directly from an async function but with PROMISES we can.



// A Promise can have one of these states:

// * pending: initial state, neither fulfilled nor rejected.
// * fulfilled: meaning that the operation was completed successfully.
// * rejected: meaning that the operation failed.


//  CONCEPT                        DESCRIPTION

// new Promise	   -->     Creates an async operation
// setTimeout	   -->     Simulates a delay (e.g., fetching data)
// .then()	       -->     Used to define what happens when the Promise is fulfilled
// .catch()	       -->     Used to handle errors or Promise rejections.
// resolve()	   -->     Call when the operation is successful
// reject()	       -->     Call when the operation fails
// all()           -->     Waits for all promises to be fulfilled. If any fails, the whole thing rejects.
// .finally()	   -->     Used to define code that will run regardless of success or failure of the Promise.






// # EXAMPLE 1:-

// let myPromise = new Promise(function(resolve, reject){
//     setTimeout(function() {
//         console.log('I am inside Promise');
//     },5000);
//     resolve(2233);
// });
 
// console.log('Pehla');

// RESULT:- Pehla
//          I am inside Promise

//          myPromise
//          Promise {<fulfilled>: 2233}
//          [[Prototype]]: Promise
//          [[PromiseState]]: "fulfilled"
//          [[PromiseResult]]: 2233







// # EXAMPLE 2:-

// let myPromise = new Promise(function(resolve, reject){
//     setTimeout(function() {
//         console.log('I am inside Promise');
//     },5000);
//     reject(new Error('Bhaisahab Error aye ha'))
// });

// console.log('Pehla');

// RESULT:- Pehla
//          Uncaught (in promise) 
//          Error: Bhaisahab Error aye ha
//          at g. (DOM-IV).js:24:12
//          at new Promise (<anonymous>)
//          at g. (DOM-IV).js:20:17
//          I am inside Promise

//          myPromise
//          Promise {<rejected>: Error: Bhaisahab Error aye ha
//          at http://127.0.0.1:5501/31.%20DOM/g.%20(DOM-IV)Promises.js:43:12…}[[Prototype]]: Promise[[PromiseState]]: "rejected"[[PromiseResult]]: Error: Bhaisahab Error aye ha
//          at http://127.0.0.1:5501/31.%20DOM/g.%20(DOM-IV)Promises.js:43:12
//          at new Promise (<anonymous>)
//          at http://127.0.0.1:5501/31.%20DOM/g.%20(DOM-IV)Promises.js:39:17message: "Bhaisahab Error aye ha"stack: "Error: Bhaisahab Error aye ha\n    at http://127.0.0.1:5501/31.%20DOM/g.%20(DOM-IV)Promises.js:43:12\n    at new Promise (<anonymous>)\n    at http://127.0.0.1:5501/31.%20DOM/g.%20(DOM-IV)Promises.js:39:17"[[Prototype]]: Object







// # EXAMPLE 3:- WRITING PROMISES WITH HELP OF then() and catch() METHODS TO ACCESS RETURNED VALUE

// Promise agr run/fulfill ho gya and hum fulfill hone k bad further uspe kam krna chahte ha to hm then() method ka use krenge.
// Promise agr fulfill nhi hota/ reject ho jta ha to usko catch ma bhej k kuch upaay krenge.


// let meraPromise1 = new Promise(function(resolve, reject) {
//     setTimeout(function() {
//     console.log('I am insde Promise1');
//     }, 5000);
//     //resolve(1234567890);
//     reject(new Error('Bhaisahab Error aaaye hai'))
//     });

//     meraPromise1.then((value) => { console.log(value)});
//     meraPromise1.catch((error) => { console.log("Recieved an Error")});




// const promiseThree = new Promise(function(resolve, reject) {
//   setTimeout(function() {
//     resolve({ username: "Ayush", email: "ayush@example.com" });
//   }, 1000); // Wait 1 second before resolving
// });

// promiseThree.then(function(user) {
//   console.log(user); // { username: 'Ayush', email: 'ayush@example.com' }
// });




// SHORT HAND NOTATION: meraPromise1.then((value) => { console.log(value), (error) => { console.log("Recieved an Error")});








// # EXAMPLE 4:- CHAINING MULTIPLE PROMISES TOGETHER

// const promiseFour = new Promise(function (resolve, reject) {
//   setTimeout(function () {
//     let error = true;

//     if (!error) {
//       resolve({ username: "ayush", password: "1234" });
//     } else {
//       reject("ERROR: Something went wrong");
//     }
//   }, 1000);
// });

// promiseFour
//   .then(function (user) {
//     console.log("User object:", user);         // Output if resolved
//     return user.username;                      // returns "ayush"
//   })
//   .then(function (username) {
//     console.log("Username:", username);        // Output username
//   })
//   .catch(function (err) {
//     console.log("Caught Error:", err);         // Output if rejected
//   })
//   .finally(function () {
//     console.log("Promise is either resolved or rejected.");
//   });







// # EXAMPLE 5:- WRITING PROMISES WITH THE HELP OF ASYNC/AWAIT TO ACCESS RETURNED VALUE IN CLEANER WAY

// const promiseFive = new Promise(function (resolve, reject) {
//   setTimeout(function () {
//     let error = true;

//     if (!error) {
//       resolve({ username: "hitesh", password: "123" });
//     } else {
//       reject("ERROR: Something went wrong");
//     }
//   }, 1000);
// });

// // Async function to consume the promise
// async function consumePromiseFive() {
//   try {
//     const response = await promiseFive; // Waits for the promise to resolve or reject
//     console.log("Response received:", response);
//   } 
//   catch (error) {
//     console.log("Caught error:", error); // Catches any rejection
//   }
// }

// consumePromiseFour();






// # Problem:-

// let waadaa1 = new Promise(function(resolve, reject) {
//      setTimeout(() => {
//          console.log('setimeout1 started');
//          },2000);
//      resolve(true);
// })

// let output = waadaa1.then(() => {
//     let waadaa2 = new Promise(function(resolve, reject) {
//         setTimeout(() => {
//             console.log('setimeout2 started'); 
//             },3000);
//             resolve("waada 2 resolved");
//         })
//     return waadaa2;
// })

// output.then((value) => console.log(value));


// # RESULT:- waada 2 resolved
//            setimeout1 started
//            setimeout2 started



// Agr 50 promises jo ek dusre pr depend krte ha unko asani se ek ek kr k execute krwana ha to async and wait ka use krenge.
// # ASYNC METHOD:- The async keyword transforms a regular JavaScript function into an asynchronous function, causing it to return a Promise.
async function utility() {
    let delhiMausam = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("Delhi me bhot garmi hai");
        },2000);
    });

    let hydMausam = new Promise((resolve, reject) => {
        setTimeout(()=> { 
            resolve ("Hyderabad is Cool");
        },4000);
    });
// Ye dono code paralelly work kr rhe ha 
    let dM = delhiMausam;
    let hM = hydMausam;

// Isliye promise ko ek k bad ek execute krwane k liye await ka use krenge.
// The await keyword is used to wait for a promise to resolve then move on to next. It can only be used within an async block.
    // let dM = await delhiMausam;
    // let hM = await hydMausam;

    return [dM, hM];  
}

// FOR RESULT: type utility(); in console







// IMPORTANT: MULTIPLE CALLBACK FUNCTION CAN LEAD TO CALLBACK HELL, BUT CHAINING PROMISES CAN HELP 

// createOrder(cart, function(orderId) {
//     proceedToPayment(orderId, function(paymentInfo) {
//         showOrderSummary(paymentInfo, function() {
//             updateWalletBalance();
//         });
//     });
// });

// ABOVE CODE HAS NESTED STRUCTURE THAT IS HARD TO READ, MAINTAIN, DEBUG AND HANDLE ERRORS,
// SO WE USE PROMISES (LIKE BELOW) TO MAKE IT SIMPLER AND GET RID OF INVERSION OF CONTROL AS PROMISES IN JS ASSURES
// OPERATION COULD BE RESOLVED INLY ONCE AND VALUE GAINED IS IMMUTABLE.


// const cart = ["shoes", "pants", "kurta"];

// // Simulate createOrder function
// function createOrder(cart) {
//     return new Promise(function(resolve, reject) {
//         setTimeout(() => {
//             if (!cart.length) {
//                 reject("Cart is empty");
//             } else {
//                 console.log("Order created");
//                 resolve("order123");  // sample order ID
//             }
//         }, 1000);
//     });
// }

// // Simulate proceedToPayment function
// function proceedToPayment(orderId) {
//     return new Promise(function(resolve, reject) {
//         setTimeout(() => {
//             console.log("Payment processed for:", orderId);
//             resolve("paymentInfo456");  // sample payment info
//         }, 1000);
//     });
// }

// // Simulate showOrderSummary function
// function showOrderSummary(paymentInfo) {
//     return new Promise(function(resolve, reject) {
//         setTimeout(() => {
//             console.log("Order summary shown for:", paymentInfo);
//             resolve();
//         }, 1000);
//     });
// }

// // Simulate updateWalletBalance function
// function updateWalletBalance() {
//     return new Promise(function(resolve, reject) {
//         setTimeout(() => {
//             console.log("Wallet balance updated");
//             resolve();
//         }, 1000);
//     });
// }

// // Chaining promises
// createOrder(cart)
// .then(function(orderId) {
//     return proceedToPayment(orderId);
// })
// .then(function(paymentInfo) {
//     return showOrderSummary(paymentInfo);
// })
// .then(function() {
//     return updateWalletBalance();
// })
// .catch(function(error) {
//     console.error("Error:", error);
// });
























// # Fetch API:- The Fetch API provides a JavaScript interface for making HTTP requests and processing the responses.
// Fetch is the modern replacement for XMLHttpRequest: unlike XMLHttpRequest, which uses callbacks, Fetch uses Promises, making the code cleaner, easier to read,
// and manageable with async/await syntax.


// BEHIND THE SCENE WORKING OF FETCH API:

// let response = fetch('something');

// As soon as fetch() is called, it is registered in global memory as a Promise object.
// This Promise is still in pending state.
// The browser (or Node) sends a network request in the background.

// Using .then() and .catch():
// * You register success and error handlers via internal arrays (onFulfilled[], onRejection[]).
// * These are invoked later when the Promise settles.

// Using async/await:
// * The JavaScript engine pauses at the await line until the Promise is resolved or rejected.
// * The await syntax essentially suspends the execution of the async function.

// If successful: the result (e.g., JSON, HTML) is passed to onFulfilled[].
// If failed: the error is passed to onRejection[].

// These callbacks are then pushed to the Microtask Queue, waiting to be executed.








// Get call with Fetch API:

// EXAMPLE - 1: Fetching a single post from a placeholder API
async function utility() {
    let content =  await fetch('https://jsonplaceholder.typicode.com/posts/1');
    let output = await content.json(); 
    console.log(output);

// json meaning:- JSON stands for JavaScript Object Notation. JSON is a lightweight format for storing and transporting data. JSON is often used when data is sent from a server to a web page.
// The JSON format is syntactically identical to the code for creating JavaScript objects.
    
}
utility();

// FOR RESULT: type content(); in console



// EXAMPLE - 2: Fetching a list of Pokémon names from the PokéAPI
async function getPokemonNames() {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10');
    const data = await response.json();
    const names = data.results.map(pokemon => pokemon.name);
    
    console.log('Pokemon names:', names);

    names.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });

  } catch (error) {
    console.error('Error fetching Pokémon:', error);
  }
}

getPokemonNames();


// Post call with Fetch API:
async function helper() {
    let options = {
        method: 'POST',          // Post call
        body: JSON.stringify({   // Converts JSON format into string
            title: 'Ayush',      // All three are data
            body: '6 Packs',
            userId: 2004,
            weight: 68,
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    };

    let content = await fetch('https://jsonplaceholder.typicode.com/posts', options);  // Sending three data fields into the server[the one in form of link inside content]
    let response = await content.json();
    return response;
}

async function utility() {
    let ans = await helper(); // Calls helper and waits for it to complete.
    console.log(ans);
}

utility();





// EXAMPLE: TO DIVE DEEP INTO ASYNC AND AWAIT FUNCTION 

// ASYNC:
// * Declares a function that always returns a Promise.
// * Even if you return a value, it is automatically wrapped in a Promise.

// AWAIT:
// * Pauses execution inside an async function until the Promise is resolved.
// * Allows writing asynchronous code in a synchronous-looking style.



// IN THE BELOW EXAMPLE WE COULD OBSERVE THAT WHEN THE HANDLER FUNCTION EXECUTES THEN ITS PRINTS "Hello World!" as it is synchrounous 
// BUT IN val1 IT WAITS FOR THE PROMISE TO RETURN A RESPONSE AND UNTIL THE RESPONSE IS IN PENDING STATE THE HANDLER FUNCTION IS TEMPORARILY 
// SUSPENDED FROM THE CALL STACK AND WHEN RESPONSE FINALLY COMES THEN IT IS AGAIN BROUGHT INTO CALL STAKC FOR FURTHER EXECUTION OF REMAINING PART BELOW



// const p1 = new Promise((resolve, reject) => {
//     setTimeout(() => {
//         resolve("Promise Resolved Value!!");
//     }, 5000);
// });

// const p2 = new Promise((resolve, reject) => {
//     setTimeout(() => {
//         resolve("Promise Resolved Value!!");
//     }, 10000);
// });


// async function handlePromise() {
//     console.log("Hello World!!");
    
//     const val1 = await p1;
//     console.log("Namaste JavaScript");
//     console.log(val1);

//     const val2 = await p2;
//     console.log("Namaste JavaScript 2");
//     console.log(val2);
// }

// handlePromise();



