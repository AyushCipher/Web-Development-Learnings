// IMPORTANT THEORY - READ THIS FIRST:

// Q. WHY CAN'T WE JUST USE NORMAL HTTP FOR A CHAT APP?
// Ans - Normal HTTP is a request-response protocol: the browser asks for
// something, the server replies, and the connection closes. That's perfect
// for loading a webpage, but terrible for chat - if someone else sends a
// message, there's no way for the server to "push" it to you. Your only
// option would be POLLING: have the browser ask "any new messages?" every
// second or so, forever, even when nothing happened. That wastes bandwidth
// and still feels laggy (see 1. Polling.png in this folder).

// Q. SO HOW DOES A WEBSOCKET FIX THAT?
// Ans - A WebSocket starts as a normal HTTP request, but asks the server to
// "upgrade" the connection. Once the server agrees, that same connection
// stays OPEN, and either side can send data through it at any time, with no
// new request needed (see 2. Websockets.png). This is what makes real-time
// chat possible: the moment someone sends a message, the server can push it
// straight to everyone else's already-open connection.

// Q. THEN WHAT IS SOCKET.IO, AND WHY NOT JUST USE THE BROWSER'S WEBSOCKET
//    API DIRECTLY?
// Ans - The raw WebSocket API works, but it only gives you the open pipe -
// you'd have to build reconnection logic, message routing, and fallbacks
// yourself. Socket.IO is a library built on top of WebSockets that adds:
//   * automatic reconnection if the connection drops
//   * named EVENTS instead of raw text (e.g. socket.emit("chatMessage", ...)
//     instead of parsing strings yourself)
//   * a fallback transport if WebSockets are somehow blocked
// That's why this project uses Socket.IO instead of the raw WebSocket API.


// HOW THIS APP WORKS, STEP BY STEP:
//
// 1. User opens the page and types a name -> browser emits "join"
// 2. Server remembers that name and tells EVERYONE a new user joined
// 3. User types a message and hits Send -> browser emits "chatMessage"
// 4. Server adds a timestamp and sends it to EVERYONE (io.emit = everyone,
//    including the sender - that's how the sender sees their own message
//    appear too)
// 5. When a user closes the tab, Socket.IO detects it automatically and
//    fires "disconnect" on the server, so we can tell everyone they left


// IMPORT MODULES

const express = require("express"); // serves our HTML/CSS/JS files
const http = require("http"); // the actual server that accepts connections
const { Server } = require("socket.io"); // adds real-time events on top


// CREATE THE SERVER

const app = express();
const server = http.createServer(app); // Express alone can't do WebSockets,
// so we wrap it in a plain http server and hand THAT to Socket.IO instead.
const io = new Server(server);

app.use(express.static("public")); // serves public/index.html, etc.


// DATA - kept simply in memory. This is one shared chat room for everyone
// (no private messages, no multiple rooms) - that's what keeps this project
// easy to follow. Anyone wanting a bigger challenge next could add rooms.

const onlineUsers = new Set(); // every username currently connected
const MAX_HISTORY = 50;
const messageHistory = []; // last N messages, so a new joiner isn't lost


// CONNECTION EVENT - this whole block runs once PER CONNECTED USER.
// Think of `socket` as "this one specific browser tab talking to us".

io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);

  // JOIN - the user picked a name, let everyone know
  socket.on("join", (userName) => {
    socket.userName = userName; // remember it on this socket for later events

    onlineUsers.add(userName);

    io.emit("userJoined", userName);
    io.emit("userList", Array.from(onlineUsers)); // Set isn't JSON-friendly, so convert it

    // Catch this one user up on messages sent before they joined.
    socket.emit("messageHistory", messageHistory);
  });

  // TYPING INDICATOR - "broadcast" means send to everyone EXCEPT the sender,
  // which is exactly what we want: you don't need to see "You are typing..."
  socket.on("typing", () => {
    socket.broadcast.emit("userTyping", socket.userName);
  });

  socket.on("stopTyping", () => {
    socket.broadcast.emit("userStoppedTyping", socket.userName);
  });

  // CHAT MESSAGE
  socket.on("chatMessage", (text) => {
    const message = {
      userName: socket.userName,
      text,
      timestamp: new Date().toISOString(),
    };

    messageHistory.push(message);
    if (messageHistory.length > MAX_HISTORY) messageHistory.shift(); // drop oldest

    io.emit("chatMessage", message); // io.emit = send to EVERYONE, sender included
  });

  // DISCONNECT - fires automatically when a tab closes, refreshes, or loses
  // connection. We didn't have to write any code to detect this ourselves -
  // that automatic detection is one of the things Socket.IO gives us for free.
  socket.on("disconnect", () => {
    if (socket.userName) {
      onlineUsers.delete(socket.userName);
      io.emit("userLeft", socket.userName);
      io.emit("userList", Array.from(onlineUsers));
    }
    console.log(`Disconnected: ${socket.id}`);
  });
});


// START SERVER

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Chat app running on http://localhost:${PORT}`);
});
