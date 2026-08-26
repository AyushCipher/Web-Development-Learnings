# Docker Volumes — Practical Implementation

## Introduction

Two small experiments with a throwaway `postgres` container - one without a volume, one with - proving directly what the concepts note explained about container filesystems being disposable by default.

---

## Practical 1 — Prove data is lost without a volume

### Commands

```bash
docker run -d --name pg-no-volume -e POSTGRES_PASSWORD=demo postgres:16-alpine
sleep 3
docker exec -it pg-no-volume psql -U postgres -c "CREATE TABLE notes (id serial, body text);"
docker exec -it pg-no-volume psql -U postgres -c "INSERT INTO notes (body) VALUES ('will this survive?');"
docker exec -it pg-no-volume psql -U postgres -c "SELECT * FROM notes;"
```

### Expected result so far

The row is there - Postgres is running normally, no volume involved yet.

### Now remove and recreate the container

```bash
docker rm -f pg-no-volume
docker run -d --name pg-no-volume -e POSTGRES_PASSWORD=demo postgres:16-alpine
sleep 3
docker exec -it pg-no-volume psql -U postgres -c "SELECT * FROM notes;"
```

### Expected result

`ERROR: relation "notes" does not exist` - the whole database is gone, because it lived entirely in the removed container's writable layer, exactly as the concepts note described.

### Clean up

```bash
docker rm -f pg-no-volume
```

---

## Practical 2 — Repeat it, this time with a named volume

### Commands

```bash
docker volume create pg-data-demo

docker run -d --name pg-with-volume \
  -e POSTGRES_PASSWORD=demo \
  -v pg-data-demo:/var/lib/postgresql/data \
  postgres:16-alpine

sleep 3
docker exec -it pg-with-volume psql -U postgres -c "CREATE TABLE notes (id serial, body text);"
docker exec -it pg-with-volume psql -U postgres -c "INSERT INTO notes (body) VALUES ('this should survive');"
```

### Remove and recreate the container, mounting the SAME volume

```bash
docker rm -f pg-with-volume

docker run -d --name pg-with-volume \
  -e POSTGRES_PASSWORD=demo \
  -v pg-data-demo:/var/lib/postgresql/data \
  postgres:16-alpine

sleep 3
docker exec -it pg-with-volume psql -U postgres -c "SELECT * FROM notes;"
```

### Expected result

The row is still there. The container itself was completely destroyed and recreated from scratch - only the volume, mounted at Postgres's own data directory, carried the data across.

---

## Practical 3 — Inspect the volume

### Command

```bash
docker volume inspect pg-data-demo
```

### What to look for

A `Mountpoint` - the actual location on the host's filesystem where Docker is keeping this data - and confirmation of which container currently has it mounted.

---

## Practical 4 — Confirm `docker compose down` vs `down -v` on the real stack

### Setup (if `code/` still has a database service with a named volume - check its current `docker-compose.yml`)

```bash
cd ../../code
docker compose up -d
```

Create some data through the app, then:

```bash
docker compose down
docker volume ls
```

### Expected result

The named volume from `docker-compose.yml` is still listed - `down` didn't touch it. Bring the stack back up and the data is still there.

```bash
docker compose down -v
docker volume ls
```

### Expected result

The volume is gone this time - `-v` is the explicit, deliberate destroy-the-data step from the concepts note, never the default.

---

## Practical 5 — Clean up

### Commands

```bash
docker rm -f pg-with-volume
docker volume rm pg-data-demo
```

---

## What this section proved

- a container's own filesystem does not survive `docker rm` - confirmed directly, not just stated
- mounting a named volume at the exact path a database already writes to is all that's needed for that data to survive container removal
- `docker volume inspect` shows real host-level detail instead of trusting volumes as an opaque concept
- `docker compose down` and `down -v` really do behave differently, on the actual project this course has been building
