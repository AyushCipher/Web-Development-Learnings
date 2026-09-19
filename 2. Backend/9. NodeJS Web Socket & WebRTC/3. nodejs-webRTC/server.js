// IMPORTANT THEORY:

// WebRTC (Web Real-Time Communication) lets two browsers send video/audio/data
// DIRECTLY to each other (peer-to-peer), without the media ever passing through
// our server. Once connected, our Node server does nothing for that call - the
// browsers talk straight to each other.

// So then... what is this server for at all?


// Q. IF MEDIA GOES DIRECTLY BETWEEN BROWSERS, WHY DO WE NEED A SERVER?
// Ans - Before two browsers can talk directly, they first need to exchange some
// setup information:
//   * "Here's the video/audio formats I support" (an SDP "offer"/"answer")
//   * "Here's how you can reach me on the network" (ICE candidates)
// This exchange is called SIGNALING, and WebRTC deliberately does NOT define how
// signaling should happen - that's left up to us. Two browsers that have never
// met can't just message each other out of nowhere, so we use a server both of
// them are already connected to (this one, over Socket.IO) as a relay/mailbox.
// Once the offer/answer/candidates have been swapped through us, the browsers
// open a direct connection and our job (for that pair) is done.


// Q. WHAT ARE OFFER / ANSWER / ICE CANDIDATES?
// Ans -
//   * OFFER  - "Here's what I can send/receive" - created by whoever starts the call
//   * ANSWER - "Here's what I can send/receive" - the reply from the other side
//   (Offer+Answer together are called SDP - Session Description Protocol)
//   * ICE CANDIDATE - "Here's one possible network address you can reach me at"
//     (could be your local IP, or a public IP discovered via a STUN server)
// A STUN server (we use Google's public one, see client.js) just answers the
// question "what does my connection look like from the outside internet?" - it
// helps with NAT traversal (most home routers hide your PC behind one shared
// public IP). We are NOT running our own STUN/TURN server here - that's a real
// piece of infrastructure on its own, out of scope for this simple project.


// Q. HOW DOES A GROUP CALL WORK IF THERE'S NO MEDIA SERVER?
// Ans - This project uses a MESH topology: every participant opens a direct,
// separate RTCPeerConnection to every OTHER participant in the room. 3 people
// in a room = each person has 2 peer connections = 6 connections total.
// This is the simplest possible way to do a group call and needs zero extra
// infrastructure, but it doesn't scale forever - each participant's upload
// bandwidth grows with the number of other people in the room. Fine for a
// handful of people (which is what this project is for); a real product with
// large rooms would use an SFU (a media-forwarding server) instead.


// Q. WHO SENDS THE OFFER TO WHOM? WON'T TWO PEOPLE OFFERING EACH OTHER AT THE
//    SAME TIME CAUSE A MESS (WHAT WEBRTC PEOPLE CALL "GLARE")?
// Ans - We sidestep that entirely with one simple rule enforced by this server:
//   THE NEWCOMER ALWAYS INITIATES.
// When you join a room, we tell YOU who is already in it ("existing-users").
// YOUR browser then creates an offer to each of them. Everyone already in the
// room only ever RECEIVES offers and sends answers back - they never initiate.
// Because only one side of any pair ever creates an offer, there's no collision
// to handle, no negotiation logic needed. Simple by construction.


// Q. WHAT DOES OUR SERVER ACTUALLY DO, THEN?
// Ans - Three jobs, none of which touch video/audio:
//   1. Track who is in which room (so we know who to relay signaling messages to)
//   2. Blindly relay signaling messages between the right two people ("signal" event)
//   3. Run the text chat that sits alongside the call (same idea as project 2)


// IMPORT MODULES

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// STATIC FILES
app.use(express.static("public"));


// DATA STRUCTURES

const rooms = new Map();
// Maps: roomName -> Set of { socketId, userName } currently in that room

const messageHistory = new Map();
// Maps: roomName -> array of chat messages, same idea as project 2

const MAX_HISTORY = 50;


// HELPER FUNCTIONS

function getRoom(roomName) {
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Map()); // socketId -> userName, inside this room
    messageHistory.set(roomName, []);
  }
  return rooms.get(roomName);
}


// CONNECTION EVENT

io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);

  // socket = represents ONE participant (one browser tab)


  // JOIN ROOM - user gives a username + a room name (room name doubles as the
  // "meeting link": share the same room name with someone and you're in a call
  // together, whether that's just the two of you or a whole group).
  socket.on("join-room", ({ roomName, userName }) => {
    socket.userName = userName;
    socket.roomName = roomName;

    const room = getRoom(roomName);

    // Everyone already sitting in this room, BEFORE we add ourselves.
    // We send this ONLY to the newcomer - see the "newcomer always initiates"
    // rule explained up top. This is the list of people the newcomer's browser
    // will send offers to.
    const existingUsers = Array.from(room, ([socketId, uName]) => ({
      socketId,
      userName: uName,
    }));

    socket.join(roomName);
    room.set(socket.id, userName);

    socket.emit("existing-users", existingUsers);

    // Tell everyone ALREADY in the room that a newcomer arrived, so their UI
    // can prepare (they don't create a peer connection yet - they wait for the
    // newcomer's offer to arrive over the "signal" event below).
    socket.to(roomName).emit("user-joined", {
      socketId: socket.id,
      userName,
    });

    // Catch this person up on the chat that already happened in this room.
    socket.emit("message-history", messageHistory.get(roomName) || []);
  });


  // SIGNALING RELAY - we never look at what's inside `data`. It might be an
  // SDP offer, an SDP answer, or an ICE candidate - doesn't matter to us, we
  // just forward it to the one specific person it's addressed to.
  socket.on("signal", ({ to, data }) => {
    io.to(to).emit("signal", {
      from: socket.id,
      data,
    });
  });


  // CHAT MESSAGE - same pattern as project 2's chatMessage event
  socket.on("chat-message", (text) => {
    const roomName = socket.roomName;
    if (!roomName) return;

    const fullMsg = {
      userName: socket.userName,
      text,
      timestamp: new Date().toISOString(),
    };

    const hist = messageHistory.get(roomName) || [];
    hist.push(fullMsg);
    if (hist.length > MAX_HISTORY) hist.shift();
    messageHistory.set(roomName, hist);

    io.to(roomName).emit("chat-message", fullMsg);
  });


  // LEAVE ROOM (explicit "leave call" button, as opposed to just closing the tab)
  socket.on("leave-room", () => {
    leaveCurrentRoom(socket);
  });


  // DISCONNECT - tab closed, refresh, lost connection, etc.
  socket.on("disconnect", () => {
    leaveCurrentRoom(socket);
    console.log(`Disconnected: ${socket.id}`);
  });


  function leaveCurrentRoom(socket) {
    const roomName = socket.roomName;
    if (!roomName) return;

    const room = rooms.get(roomName);
    if (room) {
      room.delete(socket.id);
      if (room.size === 0) {
        rooms.delete(roomName);
        messageHistory.delete(roomName);
      }
    }

    socket.leave(roomName);

    // Tell everyone left in the room to close THEIR peer connection to us and
    // remove our video tile.
    socket.to(roomName).emit("user-left", { socketId: socket.id });

    socket.roomName = null;
  }
});


// START SERVER
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WebRTC signaling server running on http://localhost:${PORT}`);
});
