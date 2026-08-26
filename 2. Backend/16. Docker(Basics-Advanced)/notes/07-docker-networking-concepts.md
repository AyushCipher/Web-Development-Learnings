# Docker Networking — Concepts

## Introduction

Section 4's Compose note said this, and left it there:

> services started by the same Compose project can talk to each other on an internal network, and they can use the service name as the hostname

That single practical rule was enough to get the MERN stack working, but it glossed over a real mechanism. This section explains what that mechanism actually is - and it's the same mechanism whether you're using Compose or plain `docker run`, Compose just sets it up for you automatically.

---

## 1) Every container gets a network namespace

Every container has its own isolated network stack by default - its own IP address, its own ports, its own routing. Two containers can't see each other's network at all unless something explicitly connects them.

That "something" is a Docker network.

---

## 2) The default bridge network (and why it's rarely what you want)

Every Docker installation comes with a default network called `bridge`. Any container started without specifying a network lands on it.

Containers on the default bridge network CAN reach each other, but only by IP address - not by name. IP addresses are assigned dynamically and change across restarts, so hardcoding one into another container's config is fragile and breaks the moment either container restarts.

This is the actual reason Section 4's Compose file could use `mongodb://mongo:27017/...` as a hostname and have it work: Compose never puts your services on the default bridge network.

---

## 3) User-defined bridge networks - where the hostname resolution comes from

When you create your own network (`docker network create ...`), Docker runs a small embedded DNS server for it. Any container attached to that network can resolve any OTHER container's name on the same network to its current IP address automatically - no hardcoded IPs, no manual configuration.

That is the entire mechanism behind `mongodb://mongo:27017` working in Section 4: Compose automatically creates a user-defined bridge network for every project and attaches every service in the file to it, using each service's name in the Compose file as its resolvable hostname. Nothing about "mongo" being special - it works because that's literally what the service was named.

---

## 4) Published ports vs. this internal DNS resolution - two completely different things

These get conflated a lot, so it's worth stating plainly:

- **publishing a port** (`-p 5000:5000`, or Compose's `ports:`) is about the HOST machine being able to reach a container
- **container-to-container name resolution** on a shared network has NOTHING to do with published ports at all

A container can reach another container on the same network by its name and its INTERNAL container port, with no `ports:` published whatsoever. This is exactly why, in Section 4's stack, the `mongo` service has no `ports:` entry at all - the `server` service never needed to reach it from the host, only from inside the same Docker network, so nothing needed publishing.

---

## 5) `docker network` as a first-class thing you can inspect

Networks aren't just an implicit side effect of Compose - they're real objects you can list, inspect, and manage directly:

- `docker network ls` - every network on the machine, including the ones Compose created for you
- `docker network inspect <name>` - which containers are attached, and their current IPs on that network
- `docker network create <name>` - make your own, for containers started with plain `docker run` instead of Compose
- `docker network connect <name> <container>` - attach an already-running container to another network

---

## Key takeaway

By the end of this section, the reader should be able to answer:

- why containers on the default bridge network can't resolve each other by name, but ones on a user-defined network can
- what actually makes `mongodb://mongo:27017` resolve inside the Compose stack from Section 4
- why publishing a port and containers resolving each other by name are two unrelated concerns
- how to inspect what network a set of containers is actually on, without Compose doing it invisibly

Section 6 (VPS deployment) relies on this understanding when reasoning about what's actually exposed to the outside world versus what only ever needs to be reachable container-to-container.
