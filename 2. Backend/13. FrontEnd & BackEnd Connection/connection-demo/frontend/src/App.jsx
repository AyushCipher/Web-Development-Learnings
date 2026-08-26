import { useEffect, useState } from "react";
import { fetchNotes, createNote, deleteNote } from "./api";

// Q. WHY TRACK loading/error SEPARATELY INSTEAD OF JUST SHOWING THE NOTES
//    ONCE THEY ARRIVE?
// ANS: A real network request has three states worth showing the user,
// not one: waiting for the response, the response failing (the backend is
// down, CORS is misconfigured, the network dropped), and the response
// succeeding. A lot of tutorial demos only ever show the success path,
// which looks fine until the one time the backend genuinely isn't
// reachable and the page just silently shows nothing with no explanation.
export default function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchNotes();
      setNotes(data.notes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      const data = await createNote(newNoteText);
      setNotes((prev) => [...prev, data.note]);
      setNewNoteText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      setError(null);
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Notes</h1>
      <p style={{ color: "#666", fontSize: 14 }}>
        Every note here is stored in the backend's memory, fetched over a real
        HTTP request - open your browser's Network tab and watch it happen.
      </p>

      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        <input
          type="text"
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          placeholder="Write a note..."
          disabled={submitting}
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add"}
        </button>
      </form>

      {error && (
        <p style={{ color: "crimson" }}>
          Something went wrong: {error}. Is the backend running?
        </p>
      )}

      {loading ? (
        <p>Loading notes from the backend...</p>
      ) : (
        <ul style={{ padding: 0, listStyle: "none" }}>
          {notes.map((note) => (
            <li
              key={note.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              {note.text}
              <button onClick={() => handleDelete(note.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
