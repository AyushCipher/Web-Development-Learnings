# Docker Volumes — Concepts

## Introduction

Section 4's Compose note introduced a `mongo-data` named volume with one line of explanation: "the database files survive container recreation." This section explains why that line was necessary at all - what happens to data WITHOUT a volume, and the actual mechanics of what a volume is doing about it.

---

## 1) A container's filesystem is disposable by default

From the Fundamentals note: a container has a thin writable layer on top of its image's read-only layers, for anything the running process changes. That writable layer belongs to the CONTAINER, not the image.

The part that surprises beginners: removing a container (`docker rm`) destroys that writable layer completely. Anything the process wrote - uploaded files, a SQLite file, and critically, a database's data directory - is gone. Stopping and restarting the SAME container is fine (the writable layer persists across stop/start); it's specifically REMOVING the container, or replacing it with a new one from a rebuilt image, that wipes it.

This is exactly the "stateless vs. stateful" distinction Section 3's concepts note already introduced. A volume is the concrete mechanism that makes a stateful container's data survive being stateless-container-style disposable.

---

## 2) What a named volume actually is

A named volume is storage that Docker manages, that exists OUTSIDE any single container's writable layer - on the host's filesystem, in a location Docker controls (you're not meant to edit it directly), tracked under a name.

```yaml
volumes:
  mongo-data:/data/db
```

This mounts the named volume `mongo-data` at `/data/db` inside the container. MongoDB writes its data files to `/data/db` exactly as it always does - it has no idea a volume is even involved. The volume just means that path's contents live independently of the container, so a new container mounting the SAME named volume at the SAME path picks up right where the last one left off.

---

## 3) Named volumes vs. bind mounts vs. `tmpfs`

Three different ways to give a container storage outside its own writable layer, for different jobs:

| Type | Where the data lives | Typical use |
|---|---|---|
| Named volume | Docker-managed location on the host | Database files, anything that should persist and that only Docker needs to touch directly |
| Bind mount | A specific path YOU choose on the host | Live-mounting your own source code into a dev container so edits show up without rebuilding |
| `tmpfs` mount | In-memory only, never touches disk | Short-lived secrets or caches that should never be written to disk at all |

A bind mount (`-v ./src:/app/src`) is what makes local development with hot-reload possible without rebuilding an image on every save - the container reads directly from your actual project folder. A named volume is the opposite use case: you deliberately DON'T want to know or care where the data physically lives, you just want Docker to keep it safe and hand it back to whichever container asks for it by name.

---

## 4) The volume lifecycle

- `docker volume create <name>` - make one explicitly (Compose does this for you the first time a service references a named volume that doesn't exist yet)
- `docker volume ls` - list every volume Docker knows about
- `docker volume inspect <name>` - where it actually lives on the host, and which containers currently use it
- `docker volume rm <name>` - delete it - and its data - permanently

---

## 5) Why `docker compose down` keeps volumes, but `down -v` doesn't

Section 4's practical note already stated the behavior; this is the reasoning behind it:

- `docker compose down` removes the containers and the network Compose created, but leaves named volumes alone - because volumes represent DATA, and data isn't something a routine "stop the stack" command should ever silently destroy
- `docker compose down -v` additionally removes the named volumes - an explicit, deliberate action for when a genuinely fresh database is wanted, never a default

This asymmetry is intentional: destroying data should require a more deliberate command than the one you run every day.

---

## Key takeaway

By the end of this section, the reader should be able to answer:

- why a container's own filesystem is the wrong place to keep anything that needs to survive `docker rm`
- what a named volume actually is, and why MongoDB in Section 4 doesn't need to know it's being used
- when a bind mount is the right tool instead of a named volume (and why source-code hot-reload setups use one)
- why `docker compose down` doesn't delete the database, but `docker compose down -v` does

Section 5 (production-ready images) and Section 6 (VPS deployment) both assume the reader understands that the DATA and the CONTAINER are two separate lifecycles - rebuilding or redeploying the app must never be something that also risks the database.
