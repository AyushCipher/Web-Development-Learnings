# Docker Networking — Practical Implementation

## Introduction

Two throwaway official images - `nginx` as a "server" and `busybox` as a client with `wget`/`ping` built in - prove the default-bridge-vs-user-defined-network difference from the concepts note directly, without needing any of this course's own application code.

---

## Practical 1 — Two containers on the default network can't resolve each other by name

### Commands

```bash
docker run -d --name web1 nginx:alpine
docker run -it --rm busybox sh
```

### Inside the busybox shell

```sh
ping web1
```

### Expected result

`ping: bad address 'web1'` - it fails. Both containers exist and are running, but neither was given a network where name resolution exists, so they landed on the default bridge network from the concepts note, where only IP addressing works.

Exit the shell (`exit`) before moving on.

---

## Practical 2 — Create a user-defined network

### Command

```bash
docker network create demo-net
```

### Verify

```bash
docker network ls
```

`demo-net` should be listed alongside the `bridge`, `host`, and `none` networks Docker ships with by default.

---

## Practical 3 — Same two containers, this time on `demo-net`

### Commands

```bash
docker rm -f web1
docker run -d --name web1 --network demo-net nginx:alpine
docker run -it --rm --network demo-net busybox sh
```

### Inside the busybox shell

```sh
ping -c 3 web1
wget -O - http://web1
```

### Expected result

Both succeed this time - `ping` gets replies, and `wget` prints nginx's default HTML page. The only thing that changed between this and Practical 1 is which network both containers are attached to.

Exit the shell when done (`exit`).

---

## Practical 4 — Inspect the network directly

### Command

```bash
docker network inspect demo-net
```

### What to look for

The `Containers` section lists `web1` with its current IP address on this network - this is the same information the embedded DNS server is using to resolve the name `web1` for anything else attached to `demo-net`.

---

## Practical 5 — Confirm this is exactly what Compose already does automatically

### Command

```bash
cd ../../code
docker compose up -d
docker network ls
```

### What to look for

A network named something like `code_default` should now exist, created automatically without ever running `docker network create` yourself - this is the network Section 4's `mongodb://mongo:27017` (or, in the current version of `code/`, the `server`/`client` services) has been resolving each other over the whole time.

```bash
docker compose down
```

---

## Practical 6 — Clean up the manual containers and network

### Commands

```bash
docker rm -f web1
docker network rm demo-net
```

---

## What this section proved

- containers on the default bridge network can reach each other only by IP, never by name
- a user-defined network (`docker network create`, or the one Compose creates automatically) gives containers name-based resolution via Docker's embedded DNS
- `docker network inspect` shows exactly what's attached and at what IP, instead of trusting it as a black box
- Compose was never doing anything magical - it was running `docker network create` for you the whole time
