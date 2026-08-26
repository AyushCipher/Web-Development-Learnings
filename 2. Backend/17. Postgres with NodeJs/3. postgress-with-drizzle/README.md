# Postgres with Drizzle

The exact same Library Management System API as `../2. postgres-with-prisma`,
rebuilt on [Drizzle ORM](https://orm.drizzle.team/) instead of Prisma - same
routes, same request/response JSON shapes, same business rules (borrow/return
stock tracking, late fines, one-review-per-member-per-book, etc.). Only the
`src/services/*.js` files differ in implementation; `src/controllers/*.js`,
`src/routes/*.js`, and `src/server.js` are unchanged, since they never touch
the ORM directly.

## Why this exists

To see the same domain modeled both ways side by side:

| | Prisma | Drizzle |
| --- | --- | --- |
| Schema | `prisma/schema.prisma` (its own DSL) | `src/db/schema.js` (plain JS/TS, IS the table definition) |
| Client | Generated (`npx prisma generate`) | Not generated - `drizzle(pool, { schema })` wraps a `pg` Pool directly |
| Relations | Implicit (`genres Genre[]` on both sides for M2M) | Explicit join table (`bookGenres`) + a `relations()` call to teach the query API about it |
| `updatedAt` | `@updatedAt` | `.$onUpdate(() => new Date())` |
| Migrations | `prisma migrate dev` | `drizzle-kit generate` + `drizzle-kit migrate` |
| Nested fetch | `include: { author: true }` | `db.query.books.findMany({ with: { author: true } })` |

## Setup

```bash
npm install
npm run db:generate   # diff src/db/schema.js -> a new SQL file under drizzle/
npm run db:migrate    # apply pending migrations in drizzle/ to DATABASE_URL
npm run dev
```

`npm run db:studio` opens Drizzle Studio (a local DB browser) against
`DATABASE_URL`.

## Endpoints

Same seven resources as the Prisma version, same paths:
`/api/authors`, `/api/books`, `/api/publishers`, `/api/genres`,
`/api/members`, `/api/reviews`, `/api/borrow-records`, plus `/health` and
`/metrics` (Prometheus). See `../2. postgres-with-prisma/docs/API_REFERENCE.md`
for the full endpoint list - it applies here unchanged.

## Notable translation details (src/services/*.js)

- **Many-to-many genres**: Prisma returns `book.genres` as a flat array via
  its implicit M2M relation. Drizzle has no implicit M2M, so books are
  fetched `with: { bookGenres: { with: { genre: true } } }` and flattened
  back into that same `genres: [...]` shape by `src/services/helpers.js`,
  so every JSON response is identical either way.
- **`addGenresToBook` vs `updateBook`'s `genreIds`**: the former only adds
  new genre links (`.onConflictDoNothing()`, mirroring Prisma's `connect`);
  the latter replaces the full set (delete then re-insert, mirroring
  Prisma's `genres: { set: [...] }`).
- **`getProlificAuthors` / `getLibraryStatistics`'s `mostPopularBooks`**:
  Prisma's relational query API can `orderBy` a related `_count`; Drizzle's
  can't, so these drop to the plain query builder (`leftJoin` + `groupBy` +
  a raw `count()` in the `orderBy`).
- **Transactions**: `prisma.$transaction(async (tx) => {...})` becomes
  `db.transaction(async (tx) => {...})` - used for `createReview` (checking
  the one-review-per-member-per-book constraint before inserting) and both
  `borrowBook`/`returnBook` (multi-step stock + record updates that must
  succeed or fail together).
