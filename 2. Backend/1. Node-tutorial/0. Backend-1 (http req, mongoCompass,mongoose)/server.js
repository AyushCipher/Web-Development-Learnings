// Server Instantiate(Creation)
const express = require('express');
const app = express();

// # Parsing is a MIDDLEWARE:-
// Parsing data in development refers to the process of analyzing and converting a data format or structure into a more usable or 
// understandable form. This is commonly done to extract meaningful information from raw data, enabling developers to manipulate or utilize the data in their applications.


// Used to parse req.body in express -> PUT or POST
const bodyParser = require('body-parser');

// Specifically parse JSON data and add it to the request.body object
app.use(bodyParser.json());


// Activate the server on port no 3000
app.listen(3000, () => {
    console.log("Server started at port no. 3000");
});


// Defining Routes and applying get request
app.get('/', (request, response) => {
    response.send("Hii, how are you?");
})

const mongoose = require('mongoose');

// Q. THE ORIGINAL VERSION OF THIS ROUTE JUST console.log'd name/brand AND
//    SENT BACK "Car submitted successfully." - WHAT WAS ACTUALLY WRONG
//    WITH THAT?
// ANS: Nothing about that response told the truth - it claimed success
// without ever calling mongoose at all, so no document was ever created.
// A client (or MongoDB Compass) would have no way to tell "the car was
// saved" from "the route is a no-op that always says yes" just from the
// HTTP response - which is exactly the gap a Mongoose model + a real
// .save() call closes.
const carSchema = new mongoose.Schema({
    name: String,
    brand: String,
}, { timestamps: true });
const Car = mongoose.model('Car', carSchema);

// Defining Routes and applying post request
app.post('/api/cars', async (request, response) => {
    const {name, brand} = request.body;
    const car = await Car.create({ name, brand });
    response.status(201).json(car);
})

// Added so the save above is actually verifiable over HTTP too, not just
// by checking MongoDB Compass directly.
app.get('/api/cars', async (request, response) => {
    const cars = await Car.find();
    response.status(200).json(cars);
})

mongoose.connect('mongodb://localhost:27017/node_tutorial_db')
.then(() => {console.log("Connection Succesful")})
.catch(() => {console.log("Recieved an error")})






// # THEORY:-

// HTTP (Hypertext Transfer Protocol) is a protocol used for communication between a client (e.g., a browser) and a server on the web. 
// It is the foundation of data exchange on the World Wide Web and enables the retrieval of resources, such as HTML documents, images, and more.




// Q. WHAT DOES HTTP DO?
// HTTP operates as a request-response protocol, where:

// 1. The client sends a request to a server.
// 2. The server processes the request and responds with the appropriate resource or an error message.



// CORE FUNCTIONS:

// * Retrieve web pages and resources.
// * Send data to servers (e.g., forms, uploads).
// * Enable interaction between web clients and APIs.




// What Does Idempotent Mean?
// An idempotent method means that no matter how many times the method is executed, the result on the server remains the same.

// Idempotent Methods:
// Examples: GET, PUT, DELETE, HEAD, OPTIONS
// If you send the same DELETE request multiple times, the resource is deleted only once. 
// Similarly, GET always retrieves the same data without modifying the server state.

// Non-Idempotent Methods:
// Examples: POST, PATCH
// Sending a POST request multiple times can create multiple new resources (e.g., duplicate entries in a database). 
// This changes the server state with each execution.

// NEED OF IDEMPOTENCY:-
// * Safety and Reliability: Ensures consistent results, even if a request is accidentally sent multiple times.
// * Caching: Idempotent requests can be cached by intermediaries (e.g., proxies, CDNs).
// * Retry Mechanisms: If a request fails, idempotent methods can be safely retried without adverse effects.




// HTTP requests are the foundation of communication between clients and servers on the web. Below is a detailed discussion of the types of HTTP requests:-

// 1. GET :-
// Purpose: Retrieve data from the server.

// Characteristics:
// * It does not modify server data.
// * The request parameters can be sent in the URL as query strings.
// * Responses are usually cacheable.

// Use Cases:
// * Fetching web pages.
// * Retrieving data from an API (e.g., /products?id=123).

// Idempotent: Yes
// * Multiple identical GET requests yield the same response and do not change the server state.



// 2. POST :-
// Purpose: Submit data to the server to create or process a resource.

// Characteristics:
// * Data is sent in the request body, not in the URL.
// * Changes the state of the server (e.g., creating new records).
// * Responses are not cacheable by default.

// Use Cases:
// * Submitting forms.
// * Uploading files.
// * Sending JSON data to APIs (e.g., to create a new user).

// Idempotent: No
// * Sending the same POST request multiple times may result in duplicate resources.



// 3. PUT :-
// Purpose: Create a new resource or update an existing one.

// Characteristics:
// * Replaces the resource at the specified URL with the data provided in the request body.
// * The entire resource is overwritten (as opposed to PATCH which updates partially).

// Use Cases:
// * Updating user profiles.
// * Replacing a file or record on the server.

// Idempotent: Yes
// * Sending the same PUT request multiple times results in the same resource state.



// 4. DELETE :-
// Purpose: Remove a resource from the server.

// Characteristics:
// * Deletes the specified resource at the given URL.
// * May return a confirmation or an error if the resource does not exist.

// Use Cases:
// * Deleting a user account.
// * Removing a specific file or record.

// Idempotent: Yes
// * Sending the same DELETE request multiple times has no further effect after the resource is deleted.



// 5. PATCH :-
// Purpose: Partially update an existing resource.

// Characteristics:
// * Only modifies the specified fields of the resource.
// * Typically used in RESTful APIs for fine-grained updates.

// Use Cases:
// * Updating a user's email address without changing other details.

// Idempotent: No
// * Multiple identical PATCH requests can result in inconsistent behavior, depending on how the server handles them.



// 6. HEAD :-
// Purpose: Retrieve metadata (headers) about a resource without fetching the actual content.

// Characteristics:
// * The response includes headers only, without a message body.
// * Commonly used to check if a resource exists or to verify caching.

// Use Cases:
// * Checking if a file exists before downloading it.
// * Validating headers like Content-Length or Last-Modified.

// Idempotent: Yes
// * Multiple identical HEAD requests yield the same response.



// 7. OPTIONS :-
// Purpose: Retrieve information about the communication options available for a resource.

// Characteristics:
// * Returns the allowed HTTP methods for a specific URL.
// * Used in CORS (Cross-Origin Resource Sharing) to check permissions.

// Use Cases:
// * Checking supported HTTP methods for an API endpoint.

// Idempotent: Yes
// * Sending multiple OPTIONS requests has no effect on the server state.


// 8. TRACE :-
// Purpose: Echo back the received request, mainly for debugging purposes.

// Characteristics:
// * Reflects what was received at the server for diagnostic purposes.
// * Rarely used due to security concerns (e.g., cross-site tracing attacks).

// Use Cases:
// * Debugging client-server communication.

// Idempotent: Yes



// 9. CONNECT :-
// Purpose: Establish a tunnel to the server for communication, typically used for HTTPS.

// Characteristics:
// * Used by proxies to create a secure, encrypted connection.

// Use Cases:
// * SSL/TLS tunneling.
// * Secure communication over a proxy.

// Idempotent: Depends on implementation (generally non-idempotent).





// DIFFERENCE EXPLAINATION OF HTTP and HTTPS:



// FEATURES:                                 HTTP	                                        HTTPS

// 1. FULL FORM:	                HyperText Transfer Protocol	                    HyperText Transfer Protocol Secure
// 2. SECURITY:	                    Not secure	                                    Secure (uses SSL/TLS encryption)
// 3. DATA ENCRYPTION:	            Data is sent in plain text	                    Data is encrypted, safe from attackers
// 4. PORT USED:	                Port 80	                                        Port 443
// 5. URL Format:	                http://example.com	                            https://example.com
// 6. SSL/TLS Certificate:	        Not required	                                Required
// 7. TRUST INDICATOR:	            Browsers may show “Not Secure” warning	        Shows a padlock
