require("dotenv").config();
const express = require("express");
const connectToDB = require("./database/db");
const authRoutes = require("./routes/auth-routes");
const homeRoutes = require("./routes/home-routes");
const adminRoutes = require("./routes/admin-routes");
const uploadImageRoutes = require("./routes/image-routes");

connectToDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/image", uploadImageRoutes);

app.listen(PORT, () => {
  console.log(`Server is now listening to PORT ${PORT}`);
});

// Q. WHAT IS THE DIFFERENCE BETWEEN AUTHENTICATION & AUTHORIZATION?
// ANS: Authentication is the process of verifying who a user is, while authorization is the process of verifying what they have access to. 
// In simple words, authentication is about validating the user's identity, whereas authorization is about validating the user's permissions.

// During authentication, the backend checks whether the user is genuine by validating credentials such as email/password, OTP, biometric data, API keys, or JWT tokens.
// If the credentials are correct, the user is considered authenticated and allowed to access the application. Authentication is the first security layer of any application because the system must first identify the user before giving access to resources.

// WORKFLOW:
// User enters email + password
//         ↓
// Backend verifies credentials
//         ↓
// JWT/session created
//         ↓
// User successfully logged in


// Authorization is the process of determining what an authenticated user is allowed to access or perform inside the system. It answers the question: "What are you allowed to do?"

// After authentication succeeds, authorization checks permissions, roles, and access rights of the user before allowing access to protected resources or actions. Authorization ensures users can only access resources they are permitted to use. 
// It is commonly implemented using roles such as admin, user, manager, or moderator.

// WORKFLOW:
// User already logged in
//         ↓
// Backend checks user role
//         ↓
// Role = admin ?
//       YES → allow access
//       NO  → deny access


// Q. WHAT IS JWT TOKEN?
// ANS: JWT (JSON Web Token) is a secure compact token-based authentication mechanism used to verify and identify users between client and server without storing session data on the server. 
// A JWT token contains encoded information such as user ID, email, role, and expiration time, digitally signed using a secret key to prevent tampering. After successful login, the backend generates a JWT token and sends it to the client. 
// The client stores this token (usually in localStorage, cookies, or sessionStorage) and sends it with future requests inside the Authorization header for authentication.


// Q. WHY USE JWT TOKEN?
// ANS: JWT is necessary because modern applications such as React, mobile apps, microservices, and distributed systems require scalable stateless authentication mechanisms. 
// Traditional authentication methods become difficult to manage when applications scale across multiple servers because session data must be shared between servers. JWT solves this problem by storing authentication information inside the token itself instead of maintaining server-side session storage. 
// It allows secure authentication, easy frontend-backend separation, better scalability, stateless APIs, and efficient authentication for REST APIs and microservice architectures.


// Q. WHY JWT IS BETTER THAN SESSIONS?
// ANS: JWT is often considered better than traditional session-based authentication for scalable modern applications because JWT is stateless while sessions are stateful. 
// In session authentication, the server stores session data in memory or databases and maintains a session ID for every logged-in user, increasing server memory usage and making scaling harder across multiple servers. 
// In JWT authentication, the server does not store authentication state because all required user information is already present inside the token. This reduces database lookups, improves scalability, supports distributed systems more easily, and works better for REST APIs, mobile apps, and microservices. 
// However, sessions can still be better in some highly secure applications because sessions allow easier invalidation and tighter server-side control.


// Q. WORKING OF JWT TOKEN?
// ANS: The JWT authentication workflow begins when a user logs in with credentials such as email and password. The backend verifies the credentials and generates a JWT token signed using a secret key. 
// This token is then sent to the client and stored on the frontend. For future protected requests, the client sends the token inside the Authorization header as a Bearer token. 
// The backend middleware extracts the token, verifies its signature using the secret key, and decodes the payload to identify the user. 
// If the token is valid, the request is allowed to access protected resources; otherwise, authentication fails and an unauthorized response is returned.


// Q. WHAT IS NODEMON?
// ANS: Nodemon is a development utility tool for Node.js applications that automatically restarts the server whenever changes are detected in project files. 
// Normally, in Node.js, developers must manually stop and restart the server after every code change, which slows development. 
// Nodemon solves this by continuously monitoring files and automatically restarting the application whenever code is modified, making development faster, smoother, and more efficient. 
// It is mainly used during development to improve productivity and reduce repetitive manual server restarts.
