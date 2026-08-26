# chat-service

Real-time 1:1 direct messaging for the social-media microservices project.
This service is architecturally different from every other service here -
read `src/socket/chatSocket.js` and `src/server.js` for the "Q. ... ANS: ..."
comments explaining why.

## Why this service is different

Every other service in this project trusts an `x-user-id` header that the
API gateway already validated. chat-service does that too for its plain REST
endpoints (conversation/message history) - but it ALSO runs a Socket.IO
server for the live connection, and clients connect to **that** directly on
this service's own exposed port, bypassing the gateway entirely, because a
plain HTTP proxy (`express-http-proxy`, what the gateway uses) can't cleanly
proxy a long-lived WebSocket upgrade. Because of that, chat-service is the
one service in the whole project that verifies a JWT itself.

## Run it

```bash
npm install
npm start
```

REST endpoints go through the gateway as usual. The live socket does not -
connect straight to this service:

```js
import { io } from "socket.io-client";

const socket = io("ws://localhost:3008", {
  auth: { token: "<jwt from identity-service>" },
});

socket.emit("send-message", { toUserId: "<other user's id>", text: "hi" }, (ack) => {
  console.log(ack); // { success: true, message: {...} }
});

socket.on("new-message", (message) => {
  console.log(message);
});
```

## REST endpoints (behind the gateway)

- `GET /api/chat/conversations` - most recent message per conversation this
  user is part of.
- `GET /api/chat/messages/:otherUserId` - full message history with the
  given user, oldest first, paginated with `page`/`limit`.

## Known limitations (on purpose, to keep this readable)

- **1:1 direct messages only, no group chat.** Deliberately kept small, in
  keeping with this whole project's "small enough to understand" scope (the
  same reasoning behind the WebRTC project's mesh-topology choice and the
  Redis e-commerce demo's feature scope elsewhere in this repo). A group
  chat feature would need a real `Conversation` collection with a member
  list - not built here.
- **Single instance only - no Redis adapter.** Live delivery works by
  joining each authenticated socket to a room named after its own user id
  and emitting straight to that room; this only works within one Node
  process. Running multiple instances of chat-service behind a load
  balancer would need a shared adapter (e.g. `@socket.io/redis-adapter`) so
  a message from a user connected to instance A still reaches a recipient
  connected to instance B - intentionally out of scope here, see the
  comment in `src/socket/chatSocket.js`.
