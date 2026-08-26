const {
  pgTable,
  serial,
  text,
  integer,
  doublePrecision,
  boolean,
  timestamp,
  primaryKey,
  uniqueIndex,
} = require("drizzle-orm/pg-core");
const { relations } = require("drizzle-orm");

/*
  Mirrors prisma/schema.prisma in "2. postgres-with-prisma" model for model
  (Author, Publisher, Genre, Book, Review, LibraryMember, BorrowRecord),
  but written the Drizzle way:
  - Drizzle has no schema-level `@updatedAt` - `$onUpdate(() => new Date())`
    is the equivalent, evaluated in JS on every update issued through Drizzle.
  - Drizzle has no implicit many-to-many like Prisma's `genres Genre[]` -
    it needs an explicit join table (bookGenres below), which the relational
    query API then hides behind a `with: { bookGenres: { with: { genre: true } } }`
    the same way services/bookService.js flattens it back into a plain
    `genres: [...]` array to keep the JSON response shape identical to the
    Prisma version.
  - snake_case column names (idiomatic Postgres/Drizzle) map to camelCase JS
    properties via the first argument to each column builder - the JSON this
    API returns still comes out camelCase either way, since that mapping is
    what `db.query...` results are keyed by, not the raw column name.
*/

const authors = pgTable("authors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  email: text("email"),
  bio: text("bio"),
  createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { precision: 3 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

const publishers = pgTable("publishers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  email: text("email"),
  country: text("country"),
  createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { precision: 3 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

const genres = pgTable("genres", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { precision: 3 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  isbn: text("isbn").notNull().unique(),
  publishedDate: timestamp("published_date", { precision: 3 }).notNull(),
  pages: integer("pages"),
  price: doublePrecision("price"),
  stock: integer("stock").notNull().default(1),
  createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { precision: 3 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  authorId: integer("author_id")
    .notNull()
    .references(() => authors.id, { onDelete: "cascade" }),
  publisherId: integer("publisher_id")
    .notNull()
    .references(() => publishers.id, { onDelete: "cascade" }),
});

// Explicit many-to-many join table (Prisma generates this implicitly as
// "_BookToGenre" - Drizzle requires defining it by hand).
const bookGenres = pgTable(
  "book_genres",
  {
    bookId: integer("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    genreId: integer("genre_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.bookId, t.genreId] })]
);

const libraryMembers = pgTable("library_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  membershipDate: timestamp("membership_date", { precision: 3 })
    .notNull()
    .defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { precision: 3 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { precision: 3 })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { precision: 3 })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    bookId: integer("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    memberId: integer("member_id")
      .notNull()
      .references(() => libraryMembers.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("review_book_member_unique").on(t.bookId, t.memberId)]
);

const borrowRecords = pgTable("borrow_records", {
  id: serial("id").primaryKey(),
  borrowDate: timestamp("borrow_date", { precision: 3 })
    .notNull()
    .defaultNow(),
  dueDate: timestamp("due_date", { precision: 3 }).notNull(),
  returnedDate: timestamp("returned_date", { precision: 3 }),
  fine: doublePrecision("fine").notNull().default(0),
  createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { precision: 3 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  bookId: integer("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  memberId: integer("member_id")
    .notNull()
    .references(() => libraryMembers.id, { onDelete: "cascade" }),
});

// RELATIONS: purely metadata for the relational query API
// (db.query.books.findMany({ with: { author: true } })) - these don't create
// SQL/columns, they just teach Drizzle how tables relate to each other.
const authorsRelations = relations(authors, ({ many }) => ({
  books: many(books),
}));

const publishersRelations = relations(publishers, ({ many }) => ({
  books: many(books),
}));

const genresRelations = relations(genres, ({ many }) => ({
  bookGenres: many(bookGenres),
}));

const booksRelations = relations(books, ({ one, many }) => ({
  author: one(authors, { fields: [books.authorId], references: [authors.id] }),
  publisher: one(publishers, {
    fields: [books.publisherId],
    references: [publishers.id],
  }),
  bookGenres: many(bookGenres),
  reviews: many(reviews),
  borrowRecords: many(borrowRecords),
}));

const bookGenresRelations = relations(bookGenres, ({ one }) => ({
  book: one(books, { fields: [bookGenres.bookId], references: [books.id] }),
  genre: one(genres, { fields: [bookGenres.genreId], references: [genres.id] }),
}));

const libraryMembersRelations = relations(libraryMembers, ({ many }) => ({
  reviews: many(reviews),
  borrowRecords: many(borrowRecords),
}));

const reviewsRelations = relations(reviews, ({ one }) => ({
  book: one(books, { fields: [reviews.bookId], references: [books.id] }),
  member: one(libraryMembers, {
    fields: [reviews.memberId],
    references: [libraryMembers.id],
  }),
}));

const borrowRecordsRelations = relations(borrowRecords, ({ one }) => ({
  book: one(books, { fields: [borrowRecords.bookId], references: [books.id] }),
  member: one(libraryMembers, {
    fields: [borrowRecords.memberId],
    references: [libraryMembers.id],
  }),
}));

module.exports = {
  authors,
  publishers,
  genres,
  books,
  bookGenres,
  libraryMembers,
  reviews,
  borrowRecords,
  authorsRelations,
  publishersRelations,
  genresRelations,
  booksRelations,
  bookGenresRelations,
  libraryMembersRelations,
  reviewsRelations,
  borrowRecordsRelations,
};
