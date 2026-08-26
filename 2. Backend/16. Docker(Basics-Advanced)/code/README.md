# MERN Demo App for Docker Course

This is a **very small MERN app** built specifically as the demo project for your Docker + GitLab CI/CD YouTube course.

## Why this app is intentionally simple
- Docker is the main topic, not app architecture.
- The code is kept small so later Docker sections stay easy to explain.
- No Docker files are included yet.
- No extra utils, services, hooks, or over-engineering.

## App features
- React + Vite + TypeScript frontend
- Express + TypeScript backend
- MongoDB connection (local by default; swap in an Atlas URI the same way if you prefer)
- Add products
- List products
- Delete products
- Health route for later Docker/Compose checks

## Project structure

```txt
docker-mern-demo/
├── client/
└── server/
```

## 1) Backend setup

```bash
cd server
npm install
npm run dev
```

Update `server/.env` with your MongoDB Atlas connection string.

## 2) Frontend setup

```bash
cd client
npm install
npm run dev
```

## Backend env

`server/.env` (used when running the server directly with `npm run dev`/`npm start`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/docker-basics-mern
```

View this database in MongoDB Compass by connecting to `mongodb://localhost:27017`.
Swap in an Atlas `mongodb+srv://...` URI here instead if you'd rather use a hosted cluster.

`.env` (repo root, next to `docker-compose.yml` - used for `${MONGODB_URI}` substitution
when running `docker-compose up --build` instead):

```env
MONGODB_URI=mongodb://host.docker.internal:27017/docker-basics-mern
```

Containers can't reach the host via `localhost`, so the Compose path needs
Docker Desktop's `host.docker.internal` name to reach the same local MongoDB.

## Frontend

No `client/.env` is needed - `App.tsx` always requests the relative path `/api/...`.
In local dev, `vite.config.ts` proxies `/api` to `http://localhost:5000` for you;
in the Docker/Compose build, nginx (`client/nginx/default.conf`) proxies it to the
`server` container instead.

## API routes

- `GET /api/health`
- `GET /api/products`
- `POST /api/products`
- `DELETE /api/products/:id`

## Sample product payload

```json
{
  "name": "Black Hoodie",
  "price": 1499,
  "category": "Clothing"
}
```
