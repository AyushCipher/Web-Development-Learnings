# 23. Basic Testing

Four testing approaches, demonstrated with [Vitest](https://vitest.dev)
against one small, real subject: a cart API (Express + MongoDB/Mongoose).
Same subject throughout deliberately, so the difference between the four
approaches is the only thing changing from file to file - not the app
being tested.

## Setup

```bash
npm install
npm test              # runs everything: unit, boundary, integration, e2e
npm run test:unit      # just one category
npm run test:watch     # re-runs on file save
```

Integration and E2E tests need a **local MongoDB running** (they connect
to `TEST_MONGODB_URI` from `.env` - a separate database from the app's own,
safe to wipe between test runs). Unit and boundary tests need nothing but
Node - they never touch a database.

To run the app itself (not the tests): `npm run dev`, then
`curl http://localhost:4100/health`.

## The four approaches, and how they differ

| | What it tests | Isolation | Speed | Files |
|---|---|---|---|---|
| **Unit** | One function, alone | Total - no DB, no HTTP, no other modules | Milliseconds | `test/unit/` |
| **Boundary** | The *edges* of valid input for a function | Same as unit - it's a technique, not a separate level | Milliseconds | `test/boundary/` |
| **Integration** | Route + validation + real MongoDB, together | None between these three pieces; supertest skips only the real network layer | Fast (no real port/socket) | `test/integration/` |
| **End-to-end (E2E)** | The whole running server, over real HTTP, across a multi-step user journey | None at all - closest to a real client hitting a real deployment | Slowest | `test/e2e/` |

**Unit tests** (`test/unit/cart.unit.test.js`) test `src/cart.js`'s pure
functions completely alone - no Express, no MongoDB. Fast and precise: a
failure here means the bug is in that one function, full stop. Also
demonstrates `vi.fn()` (a spy) for the pattern you'd use the moment a real
unit under test calls something external.

**Boundary tests** (`test/boundary/cart.boundary.test.js`) test the same
functions as the unit tests, but specifically at their valid-range edges -
zero, the minimum, the maximum, one past the maximum, empty. Most real
bugs live at these edges, not in comfortable "normal" values, which is why
this gets deliberate, separate attention even though it's really a unit-
testing *technique* rather than a different level of the pyramid.

**Integration tests** (`test/integration/cartApi.integration.test.js`)
send real HTTP requests (via `supertest`) into the real Express app from
`src/app.js`, which runs real validation and talks to a **real** local
MongoDB - not a mock. A route can be individually "correct" while still
failing to integrate with its model (wrong field name, stricter schema
validation than the route expects) - only a real database catches that.
supertest talks to the Express app in-memory (no port actually bound),
which is what separates this from the E2E tests below.

**End-to-end tests** (`test/e2e/cartFlow.e2e.test.js`) start a real server
on a real port and issue real `fetch()` calls against it - actual TCP/HTTP,
not an in-memory call into Express. A single test walks through a complete
multi-step journey (add two items -> check the total -> update a quantity
-> remove an item -> confirm the final state) rather than one request per
test, since bugs can hide specifically in the *sequence* of operations.
This is intentionally the smallest, slowest test file here - broad E2E
coverage is the most expensive kind to write and maintain, so real
projects typically reserve it for only their most critical user journeys.

## Q&A

**Q. If integration tests already hit a real database and real routes,
what's actually left for E2E to add?**
The real network stack, and multi-request journeys. supertest calls
Express's request handler directly in the same process - fast, but it
never opens a real socket, so it can't catch anything that depends on
actual HTTP transport (a misconfigured port, a header the framework adds
only over real HTTP, timing issues from real network round-trips). E2E
tests also chain several requests together as one user journey, which
single-request integration tests don't do.

**Q. Why does this project use a real MongoDB for integration/E2E tests
instead of mocking Mongoose?**
Mocking the database would just turn these back into (slower, more
verbose) unit tests of the route handler - the whole point of an
integration test is finding out whether the route and the real database
actually agree with each other. A mock only proves your code calls the
mock the way you assumed; it can't catch real schema validation rejecting
data you thought was fine.

**Q. Why is `src/app.js` (the Express app) a separate file from
`src/server.js` (which calls `.listen()`)?**
So integration tests (which want the app object, no real port) and E2E
tests (which want a real running server) can both exercise the *exact
same* route code, instead of maintaining two versions of it or forcing
integration tests to bind a real port they don't need.

**Q. In what order should you actually write these, on a real project?**
Roughly the order presented here: unit tests first (cheapest, fastest
feedback while writing the logic itself), boundary cases as part of that
same pass, integration tests once routes exist to wire the logic into,
and E2E tests last, for the handful of journeys that matter most - not
retrofitted onto every single endpoint.
