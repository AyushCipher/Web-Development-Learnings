# WebRTC Video Call + Chat

A simple video calling app: WebRTC for peer-to-peer video/audio, Socket.IO for
signaling (helping browsers find each other) and for the text chat that sits
alongside the call. Works for a 1:1 call and for a group call - same code
path both ways, see `server.js` for why.

Read the theory comment block at the top of `server.js` first - it explains
what signaling actually is and why the code is structured the way it is.
`public/client.js` then explains the browser side, step by step.

## Run it

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Try a 1:1 call

Open the page in two browser tabs (or two different browsers). Join the same
room name from both, with different names. You should see both your own
video and the other tab's video.

## Try a group call

Open a third (or fourth, fifth...) tab and join the same room name. Everyone
in the room now has a direct connection to everyone else (a "mesh") - each
tab should show every participant's video.

## Known limitations (on purpose, to keep this readable)

- **No TURN server, STUN only.** This app uses Google's public STUN server to
  help with NAT traversal. That's enough for most home networks and for
  testing on `localhost`, but calls between people on more restrictive
  networks (e.g. some corporate/mobile networks) may fail to connect. Fixing
  that properly means running your own TURN server (e.g. coturn) - a real
  piece of infrastructure, intentionally left out of this project.
- **Mesh topology, not a media server.** Every participant connects directly
  to every other participant. This is the simplest thing that works and
  needs no extra infrastructure, but each participant's upload bandwidth
  grows with the number of people in the room - fine for a handful of
  people, not meant for large group calls.
