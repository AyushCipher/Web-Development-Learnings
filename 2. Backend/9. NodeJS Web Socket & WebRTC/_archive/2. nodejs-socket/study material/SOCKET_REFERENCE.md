# Socket.io Quick Reference Guide

## 🎯 Core Methods Cheat Sheet

### **Server Side**

#### Emitting Events

```javascript
// Send to everyone
io.emit("eventName", data);

// Send to everyone EXCEPT sender
socket.broadcast.emit("eventName", data);

// Send to specific user/socket
io.to(socketId).emit("eventName", data);

// Send to specific room
io.to(roomName).emit("eventName", data);

// Send to sender only
socket.emit("eventName", data);
```

#### Room Management

```javascript
// Join a room
socket.join("roomName");

// Leave a room
socket.leave("roomName");

// Leave all rooms
socket.leaveAll();

// Get all sockets in a room
io.to("roomName").emit("eventName", data);
```

#### Event Listening

```javascript
// Listen for event from client
socket.on("eventName", (data) => {
  // Handle event
});

// Listen once (auto-remove after first call)
socket.once("eventName", (data) => {
  // Handle event only once
});

// Remove specific listener
socket.off("eventName");

// Remove all listeners
socket.removeAllListeners();
```

#### Socket Information

```javascript
// Get socket ID
socket.id

// Get all sockets in a room
io.to("roomName").fetchSockets()

// Disconnect socket
socket.disconnect();

// Check if still connected
socket.connected
```

---

### **Client Side**

#### Emitting Events

```javascript
// Send event to server
socket.emit("eventName", data);

// Send event with callback (acknowledgment)
socket.emit("eventName", data, (response) => {
  console.log("Server responded:", response);
});
```

#### Event Listening

```javascript
// Listen for event from server
socket.on("eventName", (data) => {
  // Handle event
});

// Listen once
socket.once("eventName", (data) => {
  // Handle event only once
});

// Remove listener
socket.off("eventName");
```

#### Connection Events

```javascript
// When connected
socket.on("connect", () => {
  console.log("Connected to server");
});

// When disconnected
socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

// Connection error
socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});
```

---

## 📊 Emit vs Broadcast vs To

| Method | Recipient | Use Case |
|--------|-----------|----------|
| `socket.emit()` | Sender only | Send to yourself |
| `io.emit()` | Everyone | Broadcast to all |
| `socket.broadcast.emit()` | Everyone EXCEPT sender | Notify others |
| `io.to(id).emit()` | Specific socket | Private message |
| `io.to(room).emit()` | Specific room | Room message |
| `socket.to(room).emit()` | Room EXCEPT sender | Room broadcast |

---

## 🏠 Room vs Namespace

### Rooms
```javascript
// For grouping users
socket.join("room1");
socket.join("room2"); // Can be in multiple rooms

io.to("room1").emit("message", data);
io.in("room1").emit("message", data); // Same as to()
```

### Namespaces
```javascript
// For different chat types
const chat = io.of("/chat");
const notifications = io.of("/notifications");

chat.on("connection", (socket) => {
  // Only chat users here
});

notifications.on("connection", (socket) => {
  // Only notification users here
});
```

### When to Use
- **Rooms**: Same connection, different groups (like Discord channels)
- **Namespaces**: Different connection types (chat vs notifications)

---

## 🔄 Data Flow Patterns

### Pattern 1: Simple Broadcast
```javascript
// Client → Server → All Clients
socket.emit("message", "Hello");

io.on("connection", (socket) => {
  socket.on("message", (data) => {
    io.emit("message", data); // Send to all
  });
});
```

### Pattern 2: Selective Broadcast
```javascript
// Client → Server → Specific Room
socket.emit("message", "Hello");

io.on("connection", (socket) => {
  socket.on("message", (data) => {
    io.to(socket.currentRoom).emit("message", data); // Send to room
  });
});
```

### Pattern 3: Private Message
```javascript
// Client → Server → Specific User
socket.emit("dm", {to: userId, message: "Hi"});

io.on("connection", (socket) => {
  socket.on("dm", (data) => {
    io.to(data.to).emit("dm", data); // Send to specific user
  });
});
```

### Pattern 4: Acknowledgment
```javascript
// Client with callback
socket.emit("message", "Hello", (response) => {
  console.log(response);
});

// Server with callback
socket.on("message", (data, callback) => {
  // Process
  callback("Message received"); // Send response to client
});
```

---

## 🛡️ Common Patterns

### Pattern: User Tracking
```javascript
const users = {};

socket.on("join", (userName) => {
  users[socket.id] = {
    name: userName,
    socketId: socket.id,
    joinedAt: Date.now()
  };
  
  io.emit("userList", Object.values(users));
});

socket.on("disconnect", () => {
  delete users[socket.id];
  io.emit("userList", Object.values(users));
});
```

### Pattern: Room Management
```javascript
const rooms = new Map(); // roomName -> Set of socketIds

socket.on("joinRoom", (roomName) => {
  socket.leave(socket.currentRoom);
  socket.join(roomName);
  socket.currentRoom = roomName;
  
  // Add to room tracking
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }
  rooms.get(roomName).add(socket.id);
  
  io.to(roomName).emit("userJoined", socket.userName);
});
```

### Pattern: Acknowledgment Handler
```javascript
socket.on("message", (data, callback) => {
  try {
    // Validate and process
    if (!data.text) {
      callback({ success: false, error: "Empty message" });
      return;
    }
    
    // Save to database, emit, etc.
    io.emit("message", data);
    
    // Send success response
    callback({ success: true, messageId: Date.now() });
  } catch (error) {
    callback({ success: false, error: error.message });
  }
});

// Client side
socket.emit("message", {text: "Hello"}, (response) => {
  if (response.success) {
    console.log("Message sent:", response.messageId);
  } else {
    console.error("Error:", response.error);
  }
});
```

### Pattern: Message History
```javascript
const messageHistory = [];

socket.on("message", (message) => {
  const fullMessage = {
    id: Date.now(),
    ...message,
    timestamp: new Date()
  };
  
  messageHistory.push(fullMessage);
  if (messageHistory.length > 100) messageHistory.shift();
  
  io.emit("message", fullMessage);
});

socket.on("join", (userName) => {
  socket.emit("messageHistory", messageHistory);
});
```

---

## ⏱️ Timeout & Cleanup Patterns

### Auto-disconnect Idle Users
```javascript
const userTimeouts = {};

socket.on("activity", () => {
  // Clear existing timeout
  if (userTimeouts[socket.id]) {
    clearTimeout(userTimeouts[socket.id]);
  }
  
  // Set new timeout
  userTimeouts[socket.id] = setTimeout(() => {
    socket.disconnect();
  }, 5 * 60 * 1000); // 5 minutes
});

socket.on("disconnect", () => {
  clearTimeout(userTimeouts[socket.id]);
  delete userTimeouts[socket.id];
});
```

### Debounced Events
```javascript
// Client: Debounce typing indicator
let typingTimeout;

messageInput.addEventListener("input", () => {
  socket.emit("typing");
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("stopTyping");
  }, 1000);
});
```

---

## 🔍 Debugging Patterns

### Log All Events
```javascript
// Server
const originalEmit = socket.emit.bind(socket);
socket.emit = function(event, ...args) {
  console.log(`[${socket.id}] → ${event}:`, args[0]);
  return originalEmit(event, ...args);
};

const originalOn = socket.on.bind(socket);
socket.on = function(event, callback) {
  return originalOn(event, (...args) => {
    console.log(`[${socket.id}] ← ${event}:`, args[0]);
    callback(...args);
  });
};
```

### Monitor Connection State
```javascript
// Client
socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});

socket.on("reconnect", () => {
  console.log("Reconnected");
});
```

### Check All Connected Sockets
```javascript
// Server - Get all connected socket IDs
const sockets = await io.fetchSockets();
sockets.forEach(socket => {
  console.log(socket.id, socket.userName);
});

// Get count
console.log(`Total connected: ${io.engine.clientsCount}`);
```

---

## 🚀 Performance Tips

### Efficient Broadcasting
```javascript
// ❌ Don't: Send to all every time
io.emit("update", data);

// ✅ Do: Send to relevant room only
io.to(data.roomId).emit("update", data);
```

### Batch Updates
```javascript
// ❌ Don't: Send individual updates
messageList.forEach(msg => {
  io.emit("message", msg);
});

// ✅ Do: Send batch
io.emit("messages", messageList);
```

### Use Selective Listeners
```javascript
// ❌ Don't: Listen to all socket events
io.on("connection", (socket) => {
  socket.on("*", (event) => {
    console.log(event);
  });
});

// ✅ Do: Listen to specific events only
socket.on("message", (data) => { ... });
socket.on("typing", (data) => { ... });
```

### Compress Large Data
```javascript
// For large messages, consider compression
const compressed = JSON.stringify(largeData);
socket.emit("largData", compressed);

// Or paginate
const page = 0;
const pageSize = 50;
const data = allData.slice(page * pageSize, (page + 1) * pageSize);
```

---

## 📝 Complete Server Template

```javascript
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

// Data structures
const users = {};
const rooms = {};
const messageHistory = [];

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins
  socket.on("join", (userName) => {
    socket.userName = userName;
    users[socket.id] = { name: userName, socketId: socket.id };
    
    io.emit("userJoined", userName);
    io.emit("userList", Object.values(users).map(u => u.name));
  });

  // Room join
  socket.on("joinRoom", (roomName) => {
    socket.leave(socket.currentRoom || "general");
    socket.join(roomName);
    socket.currentRoom = roomName;
  });

  // Chat message
  socket.on("chatMessage", (message) => {
    const msg = {
      id: Date.now(),
      userName: socket.userName,
      text: message,
      timestamp: new Date(),
      room: socket.currentRoom || "general"
    };
    
    messageHistory.push(msg);
    if (messageHistory.length > 100) messageHistory.shift();
    
    io.to(socket.currentRoom || "general").emit("chatMessage", msg);
  });

  // Typing indicator
  socket.on("typing", () => {
    socket.broadcast.to(socket.currentRoom || "general")
      .emit("userTyping", { userName: socket.userName });
  });

  // Disconnect
  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("userList", Object.values(users).map(u => u.name));
    io.emit("userLeft", socket.userName);
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

---

## 📝 Complete Client Template

```javascript
const socket = io();
let userName = prompt("Enter username");
let currentRoom = "general";

// DOM elements
const chat = document.getElementById("chat");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const usersList = document.getElementById("users");

// Connect
socket.emit("join", userName);

// Join room
function switchRoom(roomName) {
  currentRoom = roomName;
  socket.emit("joinRoom", roomName);
  chat.innerHTML = "";
}

// Send message
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (text) {
    socket.emit("chatMessage", text);
    messageInput.value = "";
  }
});

// Typing indicator
let typingTimeout;
messageInput.addEventListener("input", () => {
  socket.emit("typing");
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("stopTyping");
  }, 1000);
});

// Listen for events
socket.on("chatMessage", (msg) => {
  addMessage(`${msg.userName}: ${msg.text}`);
});

socket.on("userJoined", (user) => {
  addMessage(`${user} joined`, "system");
});

socket.on("userLeft", (user) => {
  addMessage(`${user} left`, "system");
});

socket.on("userList", (users) => {
  usersList.innerHTML = users.map(u => `<li>${u}</li>`).join("");
});

socket.on("userTyping", (data) => {
  addMessage(`${data.userName} is typing...`, "typing");
});

// Utility
function addMessage(text, type = "normal") {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
```

---

## 🎓 Key Takeaways

1. **emit()** = Send
2. **on()** = Listen
3. **to()** = Specific recipient
4. **broadcast** = Everyone except sender
5. **rooms** = Group of users
6. **socket.id** = Unique identifier

---

## 🔗 Resources

- Socket.io Docs: https://socket.io/docs/
- API Reference: https://socket.io/docs/v4/server-api/
- Best Practices: https://socket.io/docs/v4/best-practices/
- Examples: https://github.com/socketio/socket.io/tree/master/examples

---

**Bookmark this page for quick reference while building!**
