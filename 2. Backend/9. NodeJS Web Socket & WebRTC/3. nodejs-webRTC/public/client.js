// This file is the "browser half" of the WebRTC flow described in server.js.
// Read server.js's theory block first if you haven't - it explains WHY
// signaling exists and WHY only the newcomer ever sends an offer. Everything
// here just carries that plan out.
//
// Big picture, in order:
//   1. Ask the browser for camera/mic access, show ourselves in the grid.
//   2. Tell the server which room we want to join.
//   3. Server tells us who's already in the room -> WE offer to each of them.
//   4. Server tells everyone else that WE joined -> THEY just wait for our offer.
//   5. Offers/answers/candidates flow through the server (server.js's "signal"
//      relay) until each pair has a direct RTCPeerConnection open.
//   6. Once connected, video/audio flows directly between browsers - the
//      server is no longer involved for that pair's media.

const socket = io();

// DOM references
const joinScreen = document.getElementById("joinScreen");
const callScreen = document.getElementById("callScreen");
const userNameInput = document.getElementById("userNameInput");
const roomNameInput = document.getElementById("roomNameInput");
const joinBtn = document.getElementById("joinBtn");
const videoGrid = document.getElementById("videoGrid");
const micBtn = document.getElementById("micBtn");
const camBtn = document.getElementById("camBtn");
const leaveBtn = document.getElementById("leaveBtn");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const chatSendBtn = document.getElementById("chatSendBtn");

// STATE
let localStream = null;
let userName = "";
let roomName = "";
const peers = {};
// Maps: remoteSocketId -> RTCPeerConnection, one entry per OTHER participant.
// In a 2-person call this has 1 entry. In a 5-person call it has 4 entries
// (mesh topology - see server.js theory block).

// A STUN server just helps a peer connection figure out its own public-facing
// network address so the OTHER browser knows where to send data. We're using
// Google's free public one - no account or setup needed.
const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};


// JOIN A ROOM

joinBtn.addEventListener("click", async () => {
  userName = userNameInput.value.trim();
  roomName = roomNameInput.value.trim();

  if (!userName || !roomName) {
    alert("Please enter both your name and a room name.");
    return;
  }

  try {
    // Ask the browser for camera + mic. This will show the permission popup.
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  } catch (err) {
    alert("Could not access camera/microphone: " + err.message);
    return;
  }

  addVideoTile("local", localStream, `${userName} (You)`, true);

  joinScreen.style.display = "none";
  callScreen.classList.add("active");

  socket.emit("join-room", { roomName, userName });
});


// CREATE A PEER CONNECTION TO ONE OTHER PARTICIPANT
//
// Q. WHY IS THERE ONE createPeerConnection FUNCTION INSTEAD OF SEPARATE
//    createOffererConnection / createAnswererConnection FUNCTIONS?
// ANS: Whether WE are the one sending the offer, or we're responding to one,
// the SETUP is identical - new RTCPeerConnection, add our tracks, wire up
// onicecandidate/ontrack/onconnectionstatechange. Only what happens AFTER
// this function returns differs: the caller either calls createOffer() (see
// the "existing-users" handler below) or createAnswer() (see the "signal"
// handler's offer branch). Splitting this into two functions would just
// duplicate all of that shared setup for no benefit.
function createPeerConnection(remoteSocketId, remoteUserName) {
  const pc = new RTCPeerConnection(ICE_SERVERS);

  // Give this connection our camera/mic tracks to send out.
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  // Whenever the browser discovers a possible network path to reach us
  // (an "ICE candidate"), forward it to the other side through the server.
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("signal", {
        to: remoteSocketId,
        data: { type: "candidate", candidate: event.candidate },
      });
    }
  };

  // Fires once the other side's video/audio track starts arriving - this is
  // the moment we can actually show their video.
  pc.ontrack = (event) => {
    addVideoTile(remoteSocketId, event.streams[0], remoteUserName, false);
  };

  // If the connection drops (they closed the tab, network died, etc.) clean
  // up our side too instead of leaving a dead tile on screen.
  pc.onconnectionstatechange = () => {
    if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
      removePeer(remoteSocketId);
    }
  };

  peers[remoteSocketId] = pc;
  return pc;
}


// SIGNALING: SERVER TELLS US WHO'S ALREADY IN THE ROOM
//
// Q. WHY DOES THE CLIENT THAT JUST JOINED SEND OFFERS, INSTEAD OF THE
//    PEOPLE ALREADY IN THE ROOM OFFERING TO THE NEWCOMER?
// ANS: This is the "newcomer always initiates" rule from server.js's theory
// block - the server only ever sends `existing-users` to the person who
// just joined, never tells existing participants to go offer to a
// newcomer. Because only one specific side of any pair is ever told to
// create an offer, two peers can never simultaneously offer each other
// (WebRTC calls that collision "glare") - there's nothing to resolve
// because it can't happen by construction.
socket.on("existing-users", async (existingUsers) => {
  for (const { socketId, userName: remoteUserName } of existingUsers) {
    const pc = createPeerConnection(socketId, remoteUserName);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("signal", {
      to: socketId,
      data: { type: "offer", sdp: offer, userName },
    });
  }
});


// SIGNALING: SOMEONE ELSE JOINED THE ROOM AFTER US
//
// We don't do anything here except wait - per the "newcomer initiates" rule,
// THEY will send us an offer any moment now (handled below in "signal").
socket.on("user-joined", ({ socketId, userName: remoteUserName }) => {
  console.log(`${remoteUserName} joined the room`);
});


// SIGNALING: RECEIVED AN OFFER, ANSWER, OR ICE CANDIDATE FROM SOMEONE
socket.on("signal", async ({ from, data }) => {
  if (data.type === "offer") {
    // Someone is offering to connect to us - set up our side and answer.
    const pc = createPeerConnection(from, data.userName || "Guest");

    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("signal", {
      to: from,
      data: { type: "answer", sdp: answer },
    });
  } else if (data.type === "answer") {
    // Reply to an offer WE sent earlier - complete the handshake.
    const pc = peers[from];
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    }
  } else if (data.type === "candidate") {
    // A possible network path from the other side - hand it to that
    // connection so the browser can try it.
    const pc = peers[from];
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  }
});


// SOMEONE LEFT THE ROOM (closed tab, or hit Leave)
socket.on("user-left", ({ socketId }) => {
  removePeer(socketId);
});

function removePeer(socketId) {
  const pc = peers[socketId];
  if (pc) {
    pc.close();
    delete peers[socketId];
  }
  removeVideoTile(socketId);
}


// VIDEO GRID HELPERS

function addVideoTile(id, stream, label, isLocal) {
  // Don't add the same tile twice (e.g. ontrack can fire more than once).
  if (document.getElementById(`tile-${id}`)) return;

  const tile = document.createElement("div");
  tile.className = "video-tile";
  tile.id = `tile-${id}`;

  const video = document.createElement("video");
  video.autoplay = true;
  video.playsInline = true;
  if (isLocal) video.muted = true; // don't echo our own audio back to us
  video.srcObject = stream;

  const nameTag = document.createElement("div");
  nameTag.className = "name-tag";
  nameTag.textContent = label;

  tile.appendChild(video);
  tile.appendChild(nameTag);
  videoGrid.appendChild(tile);
}

function removeVideoTile(id) {
  const tile = document.getElementById(`tile-${id}`);
  if (tile) tile.remove();
}


// CALL CONTROLS

let micOn = true;
micBtn.addEventListener("click", () => {
  micOn = !micOn;
  localStream.getAudioTracks().forEach((track) => (track.enabled = micOn));
  micBtn.classList.toggle("off", !micOn);
  micBtn.textContent = micOn ? "🎤" : "🔇";
});

let camOn = true;
camBtn.addEventListener("click", () => {
  camOn = !camOn;
  localStream.getVideoTracks().forEach((track) => (track.enabled = camOn));
  camBtn.classList.toggle("off", !camOn);
  camBtn.textContent = camOn ? "📷" : "📵";
});

leaveBtn.addEventListener("click", () => {
  // Close every peer connection and stop our own camera/mic.
  Object.keys(peers).forEach(removePeer);
  localStream.getTracks().forEach((track) => track.stop());

  socket.emit("leave-room");
  videoGrid.innerHTML = "";
  chatMessages.innerHTML = "";

  callScreen.classList.remove("active");
  joinScreen.style.display = "block";
});


// CHAT

socket.on("message-history", (messages) => {
  messages.forEach(renderChatMessage);
});

socket.on("chat-message", (msg) => {
  renderChatMessage(msg);
});

function renderChatMessage(msg) {
  const el = document.createElement("div");
  el.className = "chat-message";
  el.innerHTML = `<span class="who">${escapeHtml(msg.userName)}:</span>${escapeHtml(msg.text)}`;
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendChatMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  socket.emit("chat-message", text);
  chatInput.value = "";
}

chatSendBtn.addEventListener("click", sendChatMessage);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendChatMessage();
});

// Basic escaping so a chat message can't inject HTML into the page.
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
