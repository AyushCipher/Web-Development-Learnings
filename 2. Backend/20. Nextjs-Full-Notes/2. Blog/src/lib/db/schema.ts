// Drizzle ORM schema: these pgTable() calls are the source of truth for
// the Postgres table shapes AND the TypeScript types used everywhere else
// (queries.ts, post-actions.ts, etc.) - Drizzle infers types from this
// file rather than requiring hand-written interfaces. `drizzle-kit`
// (see drizzle.config.ts) diffs this file against migrations in drizzle/
// to generate SQL migrations; this file itself contains no SQL, only the
// schema description.
//
// `users`, `sessions`, and `accounts` are shaped specifically to match
// what better-auth's drizzleAdapter expects (see src/lib/auth.ts, which
// remaps these table names to `user`/`session`/`account`) - this app
// doesn't own that shape, better-auth does.
import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  boolean,
  timestamp,
  text,
  serial,
} from "drizzle-orm/pg-core";


export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.id)
    .notNull(),
  token: varchar("token", { length: 255 }),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: varchar("ip_address", { length: 255 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export const accounts = pgTable("accounts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.id)
    .notNull(),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  providerId: varchar("provider_id", { length: 255 }).notNull(),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


// `.references(() => users.id)` throughout this file declares a Postgres
// foreign key - the callback form (rather than passing `users.id`
// directly) avoids a circular-reference problem since `users` and the
// tables referencing it are all defined in the same module.
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  authorId: varchar("author_id", { length: 255 })
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


// relations() calls don't create SQL/columns - they only teach Drizzle's
// relational query API (db.query.<table>.findMany({ with: {...} })) how
// tables relate, so queries.ts can write `with: { author: true }` and get
// a joined `author` object back on each post (used by getAllPosts /
// getPostBySlug and rendered in post-card.tsx / post-content.tsx).
//
// The inverse side of postsRelations below: this is what lets
// `db.query.users.findMany({ with: { posts: true } })` resolve a user's
// posts. (Previously this was accidentally a second copy of
// `relations(posts, ...)`, which meant `users` had no relations config at
// all - fixed to `relations(users, ...)` with a `many(posts)` field.)
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));


//-> one author (user) per post
export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));


// every account -> belongs to one user
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));


export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));


// This bundled object is what gets spread into drizzleAdapter's `schema`
// option in src/lib/auth.ts (`...schema, user: schema.users, ...`) and
// passed to `drizzle(pool, { schema })` in db/index.ts. Note this local
// `schema` object doesn't include the relations exports above - only the
// tables - but `import * as schema from "./schema"` (used in both of
// those files) picks up everything exported from this file regardless,
// including the relations.
export const schema = {
  users,
  accounts,
  sessions,
  posts,
};
