// CORS (Cross-Origin Resource Sharing):-
// It is a browser security mechanism that allows a server to control which frontend applications or origins are permitted to access its resources or APIs. 
// Since browsers follow the Same-Origin Policy by default, a frontend hosted on one origin (domain, protocol, or port) cannot directly communicate with a backend hosted on another origin unless the server explicitly allows it through CORS headers. 
// CORS works by sending specific HTTP headers such as Access-Control-Allow-Origin, informing the browser which origins, methods, and headers are permitted for cross-origin communication.

// Q. WHY IS CORS NEEDED?
// ANS: CORS is needed because modern web applications often have separate frontend and backend servers running on different origins. For example, a React frontend may run on http://localhost:3000 while the backend API runs on http://localhost:5000. 
// Without CORS, browsers would block such requests due to the Same-Origin Policy, preventing unauthorized websites from accessing sensitive backend resources on behalf of users. 
// CORS provides controlled and secure communication between trusted frontend applications and backend servers while still protecting users from malicious cross-origin attacks.

// WORKING OF CORS:
// ANS: When a frontend sends a request to a backend hosted on another origin, the browser first checks whether cross-origin access is allowed. For simple requests, the browser directly sends the request and checks the response headers for permissions.
// For complex requests involving custom headers, credentials, or methods like PUT and DELETE, the browser first sends a preflight OPTIONS request to the server asking whether the actual request is permitted. The backend responds with CORS headers such as allowed origins, methods, headers, and credentials. 
// If the browser finds the response valid according to CORS rules, it allows the actual request to proceed; otherwise, the request is blocked by the browser.


// CORS middleware helps backend server control which frontend origins can access its resources, what HTTP methods are allowed, which headers can be sent, and whether credentials like cookies can be included in cross-origin requests.
const cors = require("cors");

const configureCors = () => {
  return cors({ // creates middleware with custom configuration.
    // origin -> specifies which frontend origins are allowed to access the backend resources. It can be a string, an array of strings, or a function that dynamically checks the origin of incoming requests.
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:3000", // local dev
        "https://yourcustomdomain.com", // production domain
      ];

      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true); // giving permission so that req can be allowed
      } else {
        callback(new Error("Not allowed by cors"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept-Version"],
    exposedHeaders: ["X-Total-Count", "Content-Range"],
    credentials: true,        // enable support for cookies,
    preflightContinue: false,
    maxAge: 600,              // cache pre flight responses for 10 mins  (600 seconds) -> avoid sending options requests multiple times
    optionsSuccessStatus: 204,
  });
};

module.exports = { configureCors };
