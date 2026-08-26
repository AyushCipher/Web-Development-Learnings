# Docker Fundamentals — Practical Implementation

## Introduction

A tiny, disposable "hello" Node server - not the MERN app - used only to make the Dockerfile instructions and the build/run/port-mapping loop concrete before Section 3 puts them to real use.

Nothing here needs to be kept. It's a throwaway folder anywhere outside `code/`, e.g. `hello-docker/`.

---

## Practical 1 — Write the app

### Objective

Have something small enough that every line of the Dockerfile below is obviously doing exactly one thing.

### File

`hello-docker/server.js`

### Content

```js
const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello from inside a container\n");
});

server.listen(3000, () => console.log("Listening on 3000"));
```

### File

`hello-docker/package.json`

### Content

```json
{
  "name": "hello-docker",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  }
}
```

---

## Practical 2 — Write the Dockerfile

### Objective

See each instruction from the concepts note do its one job, in the order that keeps rebuilds fast.

### File

`hello-docker/Dockerfile`

### Content

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

### How to read this file

- `FROM node:20-alpine` - start from a minimal image that already has Node installed
- `WORKDIR /app` - every instruction below runs relative to `/app` inside the image
- `COPY package*.json ./` then `RUN npm install` - dependencies installed and cached BEFORE the rest of the source is copied in, so editing `server.js` later won't force a full reinstall
- `COPY . .` - the rest of the source code
- `EXPOSE 3000` - documents the port; does not publish anything by itself
- `CMD ["node", "server.js"]` - what runs when a container starts, not at build time

---

## Practical 3 — Build the image

### Command

```bash
cd hello-docker
docker build -t hello-docker .
```

### What this does

Reads the Dockerfile, executes every instruction top to bottom, and produces an image tagged `hello-docker`. No container exists yet.

### Verify

```bash
docker images
```

`hello-docker` should be listed.

---

## Practical 4 — Run a container, without publishing a port

### Command

```bash
docker run hello-docker
```

### Expected result

The terminal shows `Listening on 3000`, and the container keeps running in the foreground.

### Try to reach it

```bash
curl http://localhost:3000
```

### What happens and why

This fails (connection refused). The server IS running - just not reachable from the host, because no port was published. Stop it with `Ctrl+C` before moving on.

---

## Practical 5 — Run again, this time with a published port

### Command

```bash
docker run -p 3000:3000 hello-docker
```

### Verify

```bash
curl http://localhost:3000
```

### Expected result

`Hello from inside a container` - the exact same image as Practical 4, the only difference is `-p 3000:3000` forwarding host port 3000 into the container's port 3000.

---

## Practical 6 — See layer caching in action

### Step 1 — Rebuild with no changes

```bash
docker build -t hello-docker .
```

Every step shows `CACHED` - nothing changed, nothing re-runs.

### Step 2 — Change only `server.js`

Edit the response text in `server.js`, then rebuild:

```bash
docker build -t hello-docker .
```

### Expected result

`COPY package*.json ./` and `RUN npm install` still show `CACHED` (the dependency layers weren't affected), but `COPY . .` and everything after it re-run, because that's the first instruction that actually changed.

### What this proves

The Dockerfile's instruction order from Practical 2 is exactly why editing application code doesn't force a fresh `npm install` every time.

---

## What this section set up

- the difference between an image sitting on disk and a container actually running
- what each core Dockerfile instruction does, and when it runs (build time vs. run time)
- why `docker build` never starts anything by itself
- why a container's port is unreachable until explicitly published with `-p`
- why layer order in a Dockerfile affects rebuild speed

Section 3 assumes all of this and moves straight into containerizing a real three-part application.
