// IMPORTANT THEORY:

// Socket.IO provides real-time, two-way communication between client and server. 
// It allows instant communication without refreshing the page.

// * Connection stays open
// * Both sides can send data anytime
// * Works on top of WebSockets (and fallbacks -> If the best method doesn’t work, use another method. Eg: If WebSockets aren’t supported, use long polling) 


// Q. WHAT IS THE DIFFERENCE BETWEEN WEBSOCKETS AND SOCKET.IO?
// Ans - WebSockets is a low-level communication protocol that enables real-time, full-duplex communication between a client and server over a single TCP connection. 
// It allows both sides to send and receive data simultaneously, making it efficient for real-time applications. 
// However, WebSockets only provide the basic communication channel and do not handle features like automatic reconnection(in case internet offs, refresh, server restart), 
// fallback mechanisms (like long polling), or structured event-based messaging. Developers need to implement these features manually.

// On the other hand, Socket.IO is a higher-level library built on top of WebSockets (and other fallback transports). 
// It not only provides real-time, bidirectional communication but also adds many advanced features such as automatic reconnection, event-based communication (using emit and on), 
// rooms and namespaces, and fallback options when WebSockets are not supported. This makes Socket.IO easier to use and more robust for building real-time applications like chat systems, 
// live notifications, and multiplayer games.


// Q. WHAT IS POLLING AND HOW DO WEBSOCKETS AVOID IT?
// Ans - Polling is a technique used in traditional HTTP communication where the client repeatedly sends requests to the server at regular intervals(every 1 sec) to check if new data is available. 
// For example, in a chat application, the browser may send a request every few seconds asking, "Do you have any new messages?" Even when there are no updates, requests are still sent, 
// leading to unnecessary network traffic and increased server load.

// This approach is inefficient because:
// * Many requests return no new data (wasted bandwidth)
// * Increased latency (user sees updates with delay)
// * Higher server load due to repeated requests

// WebSockets avoid polling by establishing a persistent, open connection between the client and server. 
// Once the connection is established, the server can push data to the client instantly whenever new data is available, without waiting for the client to request it.

// Step 1: Client sends an HTTP request with upgrade headers
// Example:
// GET /chat HTTP/1.1
// Host: server.com
// Upgrade: websocket
// Connection: Upgrade

// Step 2: Server accepts and responds with status 101 Switching Protocols
// HTTP/1.1 101 Switching Protocols
// Upgrade: websocket
// Connection: Upgrade

// After this handshake, the HTTP connection is upgraded to a WebSocket connection.

// This makes communication:
// * Real-time (instant updates)
// * Efficient (no unnecessary requests)
// * Low latency (no delay in receiving data)


// Q. DIFFERENCE BETWEEN HTTP AND SOCKET.IO?
// Ans - In a traditional HTTP client–server model, communication follows a simple request–response cycle: 
// the client sends a request (like GET /products), the server responds with data, and then the connection closes. 
// This makes it stateless and straightforward, but not suitable for real-time updates. 
// If something changes — like a new message — the client has to either refresh the page or repeatedly poll the server, which is inefficient.

// In contrast, Socket.IO uses a continuous, open connection between the client and server. Once connected, both sides can send data anytime without waiting for a new request. 
// This makes it stateful and ideal for real-time applications like chat apps or live notifications. Unlike HTTP where communication is one-way per request, 
// Socket.IO enables two-way, real-time communication with better efficiency for dynamic updates.


// WORKING:-
// After connection: Client ⇄ Server (connection stays open)

// Both sides are:
// * idle most of the time
// * but ready to react to events


// WORKFLOW:
// * User opens page
//       ↓
// * Client connects to server (socket)
//       ↓
// * User enters name → send "join"
//       ↓
// * Server stores user + broadcasts
//       ↓
// * User sends message → "chatMessage"
//       ↓
// * Server sends to ALL users
//       ↓
// * Typing events + disconnect handled


// IMPORT MODULES

const express = require("express");     // Express = handles routes (CHEF 👨‍🍳)
const http = require("http");           // HTTP = actual server (KITCHEN 🏢)
const socketIo = require("socket.io");  // Socket.IO = real-time (WAITER 🚀)


// Q. What Express actually is?
// Ans - Express is a Node.js web framework which helps you:
// * define routes (/api, /login)
// * handle requests & responses
// * use middleware

// So, Express = brain (logic), not the body (server)

// Q. What the HTTP module is
// Ans - http is the actual server creator which 
// * opens a port
// * listens to network requests
// * handles TCP connections

// So, HTTP = body (actual server)


// CREATE SERVER 
const app = express();                   // Creates Express app (request handler)

const server = http.createServer(app);  // Creates actual HTTP server
// Flow: Client → HTTP server → Express handles request

const io = socketIo(server);            // Attach Socket.IO to server


// STATIC FILES 
app.use(express.static("public"));      // Serves frontend files (index.html, CSS, JS)


// DATA STRUCTURES 
const users = new Set();                // Stores unique usernames

const userSockets = new Map();  
// Maps: username → socketId, used for private messaging

const rooms = new Map();        
// Maps: roomName → Set of users

const messageHistory = new Map();  
// Maps: roomName → array of messages, stores chat history per room

const MAX_HISTORY = 50;         
// Only store last 50 messages per room



// HELPER FUNCTION
function getRoom(roomName) {
  // If room doesn't exist → create it
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
    messageHistory.set(roomName, []);
  }
  return rooms.get(roomName);
}


// CONNECTION EVENT
io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);

  // socket = represents ONE user


  // JOIN EVENT - when user joins with username and room
  socket.on("join", (userName) => {

    users.add(userName);                    // Add user to global list
    socket.userName = userName;             // Store username in socket

    userSockets.set(userName, socket.id);   // Map username → socketId


    const defaultRoom = "general";

    socket.join(defaultRoom);               // Join default room
    socket.currentRoom = defaultRoom;       // Track current room

    getRoom(defaultRoom).add(userName);     // Add user to room


    // Broadcast to all users
    io.emit("userJoined", userName);

    // Send updated lists
    io.emit("userList", Array.from(users));
    io.emit("roomList", Array.from(rooms.keys()));


    // Send previous chat history only to this user
    socket.emit("messageHistory", messageHistory.get(defaultRoom) || []);
  });



  // TYPING EVENTS - when user starts or stops typing
  socket.on("typing", () => {
    const rm = socket.currentRoom || "general";   // Get the room user is currently in

    // Send to everyone in room EXCEPT sender
    socket.broadcast.to(rm).emit("userTyping", socket.userName);
  });

  socket.on("stopTyping", () => {
    const rm = socket.currentRoom || "general";
    socket.broadcast.to(rm).emit("userStoppedTyping", socket.userName);
  });



  // PUBLIC MESSAGE - sent to everyone in the same room
  socket.on("chatMessage", (msg) => {

    const rm = socket.currentRoom || "general";

    // Create full message object
    const fullMsg = {
      ...msg,
      timestamp: new Date().toISOString(),
      room: rm,
      type: "public",
    };


    // Store message in history
    const hist = messageHistory.get(rm) || [];
    hist.push(fullMsg);

    // Maintain max history limit
    if (hist.length > MAX_HISTORY) hist.shift();

    messageHistory.set(rm, hist);


    // Send message to ALL users in that room
    io.to(rm).emit("chatMessage", fullMsg);
  });


  // PRIVATE MESSAGE - sent directly between two users
  socket.on("privateMessage", (data) => {

    // Find receiver socketId
    const recipientId = userSockets.get(data.toUserName);

    if (recipientId) {

      const pmsg = {
        from: socket.userName,
        to: data.toUserName,
        text: data.message,
        timestamp: new Date().toISOString(),
        type: "private",
      };

      // Send to receiver
      io.to(recipientId).emit("privateMessage", pmsg);

      // Send back to sender (so sender sees message)
      io.to(socket.id).emit("privateMessage", {
        ...pmsg,
        isOwn: true,
      });
    }
  });


  // SWITCH ROOM 
  socket.on("switchRoom", (newRoom) => {

    const oldRoom = socket.currentRoom || "general";
    const uname = socket.userName;

    if (oldRoom !== newRoom) {

      socket.leave(oldRoom);                    // Leave old room
      getRoom(oldRoom).delete(uname);           // Remove user

      io.to(oldRoom).emit("userLeftRoom", {
        user: uname,
        room: oldRoom,
      });

      socket.join(newRoom);                     // Join new room
      socket.currentRoom = newRoom;

      getRoom(newRoom).add(uname);

      // Notify new room
      io.to(newRoom).emit("userJoinedRoom", {
        user: uname,
        room: newRoom,
        users: Array.from(getRoom(newRoom)),    
        // Set { "Ayush", "Rahul" } → Array.from() → Array [ "Ayush", "Rahul" ] as Set is not iterable & Set is not JSON-friendly, we need to convert it to array before sending to client
      });

      // Send chat history of new room
      socket.emit("messageHistory", messageHistory.get(newRoom) || []);

      // Update room list globally
      io.emit("roomList", Array.from(rooms.keys()));
    }
  });


  // CREATE ROOM - create a new chat room
  socket.on("createRoom", (roomName) => {

    if (!rooms.has(roomName)) {
      getRoom(roomName);  // Create room

      io.emit("roomList", Array.from(rooms.keys()));      // Update all users with new room list
    }
  });


  // DISCONNECT - when user disconnects
  socket.on("disconnect", () => {

    const uname = socket.userName;
    const rm = socket.currentRoom || "general";

    if (uname) {
      users.delete(uname);             // Remove user
      userSockets.delete(uname);       // Remove mapping
      getRoom(rm).delete(uname);       // Remove from room

      // Notify all users
      io.emit("userLeft", uname);
      io.emit("userList", Array.from(users));
    }
  });
});


// START SERVER
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Chat Server running on http://localhost:${PORT}`);
});

// In Socket.IO, both client and server use event-driven listeners that stay active over a persistent connection, 
// enabling real-time two-way communication without continuous polling
