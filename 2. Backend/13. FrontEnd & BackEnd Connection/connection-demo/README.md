# Frontend + Backend Connection Demo

A small Notes app whose entire point is the CONNECTION between an
independently-run frontend and backend - not the notes themselves, and
deliberately no database (see the comment in `backend/server.js` for why).

Read `backend/server.js`'s CORS comment and `frontend/src/api.js`'s comment
on the env-driven API URL first - those two are what this project actually
exists to teach.

## Run it

**Backend:**
```bash
cd backend
cp .env.example .env
npm install
npm run dev      # http://localhost:4000
```

**Frontend** (in a second terminal):
```bash
cd frontend
cp .env.example .env
npm install
npm run dev       # http://localhost:5173
```

## What to actually look at

Open your browser's DevTools Network tab while using the app, and you'll see:

- the frontend making real requests to `http://localhost:4000/api/notes` -
  that URL comes from `VITE_API_URL` in `frontend/.env`, not a hardcoded
  string
- an `OPTIONS` preflight request before the `POST`/`DELETE` calls - the
  browser checking with the backend whether cross-origin write requests are
  allowed, before it sends the real one
- if you stop the backend and try to add a note, the frontend shows a real
  error message instead of silently doing nothing - that's the
  loading/error/success state handling in `App.jsx`

## Known issue on Windows: `npm run dev` / `npm run build` may fail in the frontend

If you're on Windows and see an error like `Cannot find module '...\2. Backend\vite\bin\vite.js'`
(a path that's missing most of the real folder structure), this is a real
bug in how npm's generated `.cmd`/`.ps1` shim scripts handle the `&` in
this repo's own `13. FrontEnd & BackEnd Connection` folder name - not a bug
in this project. It affects any tool invoked through an npm binary shim
(like `vite`) run from inside this folder tree; `npm start` in `backend/`
is unaffected because it just spawns `node` directly, with no shim involved.

Workaround - run vite directly instead of through the npm shim:

```bash
node node_modules/vite/bin/vite.js        # instead of npm run dev
node node_modules/vite/bin/vite.js build  # instead of npm run build
```

The real fix is renaming the parent folder to remove the `&` - worth doing
if this keeps being annoying, but out of scope for this project itself.

## Deliberate simplifications

- **No database.** An in-memory array on the backend - restarting the
  server resets the notes. This folder is about the HTTP connection, not
  persistence (which has dedicated folders elsewhere in this repo).
- **No auth.** Nothing here is a real user account system, on purpose,
  same reasoning as above.
