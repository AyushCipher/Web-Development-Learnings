# 2. Backend

A structured, hands-on progression through backend web development with
Node.js - from raw HTTP and Express fundamentals through databases, auth,
real-time systems, microservices, TypeScript, GraphQL, Docker, and
agentic AI. Each numbered folder is a self-contained project (its own
`package.json`, its own `.env`) covering a specific topic in depth, with
extensive Q&A-style comments in the source explaining not just *what* the
code does but *why* it's built that way.

## How this folder is organized

Every project below is independently runnable:

```bash
cd "<folder name>"
npm install
npm run dev   # or: node index.js / node server.js - check package.json
```

Each project's `.env` documents what it needs inline. Where a database is
required, MongoDB/PostgreSQL projects default to a local instance
(`mongodb://localhost:27017/...`, `postgresql://postgres:...@localhost:5432/...`)
so it's viewable directly in MongoDB Compass / any Postgres GUI - no cloud
account needed to run most of these. A few projects intentionally need a
real hosted service they can't be localized against (Supabase, PayPal,
Google OAuth) - those are called out in their own folder.

## Topics covered, in progression order

| Folder | Topic |
|---|---|
| 1. Node-tutorial | Raw Node.js: HTTP module, modules/`require`, npm, Mongoose basics |
| 2. Express-tutorial | Express fundamentals through an MVC-structured "Extended" app |
| 3. EJS-tutorial | Server-rendered views with EJS templating |
| 4. Rest-API-Dev(Not Modular) | A REST API written flat, before introducing MVC structure |
| 5. Mongodb-Basics | Mongoose schemas, models, and CRUD queries |
| 6. Working With API | Three full REST APIs (Bookstore, Todo, Blog) with MVC structure |
| 7. Authentication & File Upload | JWT auth, bcrypt, 2FA/TOTP, Google OAuth, Twilio OTP, Cloudinary uploads - culminating in a combined-features "SANGAM" app |
| 8. Mongodb-Intermediate | Aggregation pipelines, transactions, advanced queries |
| 9. NodeJS Web Socket & WebRTC | Real-time chat (Socket.IO) and peer-to-peer video (WebRTC signaling) |
| 10. Nodejs-graphql | GraphQL from basics through a Mongoose-integrated project (Apollo Server 4) |
| 11. Nodejs-with-typescript | Node + Express in TypeScript, path aliases, production builds |
| 12. Supabase with React TS | Supabase (Postgres + Auth + Storage + Realtime) with a React/Vite frontend |
| 13. FrontEnd & BackEnd Connection | Wiring a separate frontend and backend together (CORS, API contracts) |
| 14. NodeJS-Redis-Kafka | Redis data structures/caching/pub-sub, and a Kafka (Redpanda) producer/consumer app |
| 15. Nodejs-SocialMedia-Microservices | A 9-service microservices architecture (API gateway, identity, post, media, search, like, comment, notification, chat) with RabbitMQ events and Redis caching |
| 16. Docker(Basics-Advanced) | Containerizing a MERN app: Dockerfiles, Compose, nginx reverse proxy |
| 17. Postgres with NodeJs | Raw `pg`, Prisma, and Drizzle ORM against PostgreSQL |
| 18. Nest-js | NestJS fundamentals (travel-tracker, file-upload, core concepts) |
| 19. bun-and-hono | The Bun runtime with the Hono web framework |
| 20. Nextjs-Full-Notes | Next.js App Router in depth (concepts reference, a Blog app, an Asset Manager with Drizzle/PayPal/Cloudinary/Better Auth) |
| 21. Agentic AI | LangChain + LangGraph agents, RAG with a vector database (Qdrant), and Model Context Protocol (MCP) |
| 22. Deployment | EC2 deploy demo: Docker + Compose + a GitHub Actions SSH workflow |
| 23. Basic Testing(Vitest) | Unit, boundary, integration, and E2E testing examples with Vitest against a small cart API |
| 52. Backend-4 (Theory) | Written notes/theory accompanying the practical folders |

## A few notes on specific folders

- **7. Authentication & File Upload** - `1. Auth with many features(SANGAM)`
  is the most complete auth implementation here (JWT + refresh tokens, file
  upload, email notifications) - start there if you want one project that
  demonstrates the full picture rather than piecing it together across
  the earlier, narrower auth exercises.
- **15. Nodejs-SocialMedia-Microservices** and **16. Docker(Basics-Advanced)**
  are the two projects that actually use Docker Compose/RabbitMQ/multiple
  coordinated services - the rest of this folder runs as single standalone
  Node processes.
- **21. Agentic AI** covers the current generation of AI-agent concepts
  (tool-calling agents, memory, RAG, vector search, and MCP) as a natural
  extension of the backend fundamentals covered everywhere else in this
  folder.
- **23. Basic Testing(Vitest)** covers the four common levels of testing
  (unit, boundary, integration, E2E) against the same small cart API, with
  each test file running against its own isolated database so Vitest can
  parallelize test files safely.

## What this folder is (and isn't)

This is a personal learning/practice repository, not a portfolio of
production services - the goal throughout is depth of understanding over
polish. Comments favor explaining *why* a piece of code is written the way
it is (trade-offs, gotchas, the bug that a particular line fixes) over
restating what's already obvious from the code itself.
