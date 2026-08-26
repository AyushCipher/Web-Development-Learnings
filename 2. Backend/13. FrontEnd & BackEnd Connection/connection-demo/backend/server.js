require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());

// Q. THE FRONTEND AND BACKEND ARE BOTH ON "localhost" - WHY DOES THIS NEED
//    CORS CONFIGURATION AT ALL?
// ANS: The browser doesn't just check the hostname - it treats
// http://localhost:5173 (the Vite dev server) and http://localhost:4000
// (this API) as two DIFFERENT origins, because the PORT is part of an
// origin too, not just the domain. By default, a browser blocks a page on
// one origin from reading a response from a different origin - that's the
// same-origin policy, and it's what CORS headers exist to selectively
// relax. Without the line below, the frontend's fetch calls would still
// technically reach this server (the request goes out fine), but the
// browser would refuse to hand the RESPONSE back to the frontend's
// JavaScript, and the console would show a CORS error.
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  })
);

// Q. WHY IS THIS "DATABASE" JUST AN ARRAY IN MEMORY?
// ANS: On purpose. This folder exists to demonstrate the CONNECTION between
// a frontend and a backend - the fetch calls, the CORS handshake, the
// env-driven API URL - not database setup, which already has its own
// dedicated folders elsewhere in this repo. A real database would also mean
// a real credential to manage, and keeping this demo credential-free avoids
// ever repeating that mistake here. The one real cost: this data resets
// every time the server restarts - there is no persistence, by design.
let notes = [
  { id: 1, text: "This note came from the backend's in-memory array" },
];
let nextId = 2;

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/notes", (req, res) => {
  res.json({ success: true, notes });
});

app.post("/api/notes", (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: "text is required" });
  }

  const note = { id: nextId++, text: text.trim() };
  notes.push(note);

  res.status(201).json({ success: true, note });
});

app.delete("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const exists = notes.some((n) => n.id === id);

  if (!exists) {
    return res.status(404).json({ success: false, message: "Note not found" });
  }

  notes = notes.filter((n) => n.id !== id);
  res.json({ success: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Allowing requests from ${process.env.CLIENT_ORIGIN || "http://localhost:5173"}`);
});
