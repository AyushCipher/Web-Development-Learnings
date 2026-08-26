# Redis Concepts via a Small E-commerce Backend

`1. Redis` (the sibling folder) teaches Redis through standalone scripts that
just print output to the console. This one teaches the same five concepts
by being an actual, small, runnable e-commerce API — auth + products, real
requests, real responses.

Five Redis concepts, each with the file that implements it:

| Concept | Where |
|---|---|
| API caching (cache-aside) | `src/controllers/product.controller.js` |
| OTP storage (generate/save/auto-expire) | `src/services/otp.service.js` |
| Sessions (JWT + Redis + cookie) | `src/services/session.service.js`, `src/middleware/requireAuth.js` |
| Rate limiting | `src/middleware/rateLimiter.js` |
| Queues (BullMQ pub/sub-style) | `src/queues/email.queue.js`, `src/worker.js` |

Read the `Q. ... ANS: ...` comment right above the relevant code in each
file — that's where the "why", not just the "how", lives.

## Run it

```bash
docker compose up -d      # starts MongoDB + Redis
cp .env.example .env
npm install
npm run seed               # adds 5 demo products
npm run dev                 # starts the API on :5000
```

In a **second terminal**, start the queue worker (it's a separate process
on purpose — see the comment in `src/queues/email.queue.js`):

```bash
npm run worker:dev
```

## Try each concept

**Queues** — sign up, then watch the worker's terminal print the "email"
about 2 seconds later:
```bash
curl -X POST localhost:5000/api/auth/signup -H "Content-Type: application/json" \
  -d '{"name":"Ayush","email":"ayush@example.com","password":"pass1234"}'
```

**OTP + Sessions** — log in (returns an OTP — see the note below on why),
then verify it to actually get logged in (sets a cookie):
```bash
curl -c cookies.txt -X POST localhost:5000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"ayush@example.com","password":"pass1234"}'
# copy the "otp" from the response into the next command
curl -c cookies.txt -b cookies.txt -X POST localhost:5000/api/auth/verify-otp -H "Content-Type: application/json" \
  -d '{"email":"ayush@example.com","otp":"123456"}'
```

**API caching** — call this twice and compare the API's terminal output:
```bash
curl localhost:5000/api/products   # logs [CACHE MISS], then [CACHE HIT] on the 2nd call
```
Create a product (needs the cookie from above) and the list cache is
invalidated — the next `GET` logs `[CACHE MISS]` again:
```bash
curl -b cookies.txt -X POST localhost:5000/api/products -H "Content-Type: application/json" \
  -d '{"name":"Desk Mat","price":499,"stock":30}'
```

**Rate limiting** — hit login 6 times in a row; the 6th gets `429`:
```bash
for i in {1..6}; do curl -X POST localhost:5000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"ayush@example.com","password":"wrong"}'; done
```

## Deliberate simplifications (called out, not hidden)

- **The OTP is returned in the API response.** A real app would text or
  email it and never put it in the response body. This project has no real
  email/SMS provider wired up, so returning it is the only way to actually
  test the flow — clearly not a production pattern.
- **No cart, checkout, or orders.** Only auth + products exist, on purpose
  — enough surface area to host all five Redis concepts clearly without
  unrelated e-commerce logic getting in the way of the point of this
  project.
- **`sendWelcomeEmail` doesn't send anything real** — it's a 2-second delay
  plus a `console.log`, just enough to make the queue/worker split visibly
  do something.
