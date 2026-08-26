// Q. WHY DOES THE API URL COME FROM AN ENV VAR INSTEAD OF JUST WRITING
//    "http://localhost:4000" DIRECTLY IN THE FETCH CALLS?
// ANS: This exact code is going to run in more than one place - your
// machine during development, and wherever this gets deployed later - and
// the backend will be at a DIFFERENT URL in each place. Vite exposes any
// env var prefixed with VITE_ on `import.meta.env` at build time, so
// changing where the frontend points is a config change (edit .env,
// rebuild), never a code change. This is the same idea as every backend
// project in this repo reading MONGODB_URI/REDIS_URL from the environment
// instead of hardcoding "localhost" - just on the frontend side this time.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

export function fetchNotes() {
  return request("/api/notes");
}

export function createNote(text) {
  return request("/api/notes", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function deleteNote(id) {
  return request(`/api/notes/${id}`, { method: "DELETE" });
}
