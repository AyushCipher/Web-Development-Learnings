# Docker Fundamentals — Concepts

## Introduction

Everything from Section 3 onward assumes the reader already knows what an image is, what a container is, and how a Dockerfile turns one into the other. This section fills that gap before the MERN app shows up.

The example used here is deliberately not the MERN app. It's a single tiny "hello" Node server, on purpose: this content needs to make sense before the reader has touched `code/` at all, and keeping it self-contained means it never goes stale as the MERN app keeps evolving in later sections.

---

## 1) What a container actually is

A container is not a lightweight virtual machine, even though it's often described that way for convenience.

A container is a normal process running on the host machine, isolated from other processes using features already built into the Linux kernel (namespaces for isolation, cgroups for resource limits). It looks like it has its own filesystem, its own network stack, and its own process tree - but under the hood it's sharing the host's kernel with every other container.

This is the whole reason containers start in milliseconds and virtual machines take tens of seconds: a VM boots an entire operating system kernel from scratch, a container just becomes a new isolated view into the kernel that's already running.

---

## 2) Image vs. container

These two words get used almost interchangeably by beginners, but they mean different things:

- an **image** is a read-only template - a frozen filesystem snapshot plus metadata (what command to run, what port it expects, what environment variables it wants)
- a **container** is a running (or stopped) instance created FROM an image, with a thin writable layer on top for anything the process changes while it runs

The relationship is the same as a class and an object, or a recipe and a cooked meal. One image can produce many containers, each isolated from the others, each with its own writable layer that disappears when the container is removed (this matters a lot later - see the Volumes section for what to do about it).

---

## 3) What a Dockerfile actually describes

A Dockerfile is not a script that "sets up a server." It's a list of instructions for BUILDING AN IMAGE, executed once at build time, not at run time.

The instructions that matter for almost every app:

- `FROM` - the base image to start from (an existing image, usually a minimal OS + language runtime, e.g. `node:20-alpine`)
- `WORKDIR` - sets the working directory inside the image for every instruction after it
- `COPY` - copies files from the build context (the folder you run `docker build` from) into the image
- `RUN` - executes a command AT BUILD TIME and bakes its result into the image (e.g. `npm install`)
- `EXPOSE` - documentation that the container listens on a given port - it does not actually publish anything (see the Port Mapping section below for what does)
- `CMD` - the command that runs when a CONTAINER STARTS from this image (not at build time)

`RUN` vs `CMD` is the single most common point of confusion: `RUN` happens once, while the image is being built, and its result becomes part of the image. `CMD` happens every time a new container starts from that image, and does not change the image itself.

---

## 4) Why instruction order affects build speed (layer caching)

Every instruction in a Dockerfile creates a new, cached layer. When you rebuild an image, Docker compares each instruction against its cache and reuses layers that haven't changed, only re-running the ones that have - and everything AFTER the first changed instruction, even if those later instructions themselves didn't change.

That's why the conventional Node.js Dockerfile pattern copies `package.json` and installs dependencies BEFORE copying the rest of the source code:

```dockerfile
COPY package*.json ./
RUN npm install
COPY . .
```

Application source code changes on nearly every build. Dependencies change rarely. Ordering it this way means `npm install` only re-runs when `package.json` actually changed, not every single time any source file changed - turning a rebuild that could take a minute into one that takes a few seconds most of the time.

---

## 5) What `docker build` and `docker run` actually do

Two separate steps, two separate commands:

- `docker build` reads a Dockerfile and a build context, executes every instruction, and produces an IMAGE (`docker build -t my-app .`)
- `docker run` takes an image and starts a CONTAINER from it (`docker run my-app`)

A very common beginner mistake is expecting `docker build` to also start the app - it doesn't. The image sitting on disk after a build isn't running anything; nothing happens until `docker run` creates a container from it.

---

## 6) Port mapping - why containers are invisible from the host by default

A process running inside a container is, by default, only reachable from OTHER processes inside that same container's network namespace - not from the host machine, and not from the internet.

`-p <host-port>:<container-port>` (or `ports:` in Compose - see Section 4) publishes a port: it tells Docker to forward traffic arriving on the HOST at `<host-port>` into the CONTAINER at `<container-port>`.

```bash
docker run -p 3000:3000 my-app
```

This is why a Dockerfile's `EXPOSE` instruction alone is not enough to reach an app from a browser - `EXPOSE` only documents intent for humans and other tooling; `-p` (or Compose's `ports:`) is the thing that actually opens the door from the host machine's ports.

---

## Key takeaway

By the end of this section, the reader should be able to answer:

- what's the actual difference between an image and a container (a template vs. a running instance of it)
- why `RUN` and `CMD` behave completely differently despite looking similar
- why the order of instructions in a Dockerfile affects how fast rebuilds are
- why `docker build` alone never starts anything
- why a container's port is invisible from outside until it's explicitly published

Section 3 builds directly on all five of these - it just never says so explicitly, because it assumes the reader already has this foundation.
