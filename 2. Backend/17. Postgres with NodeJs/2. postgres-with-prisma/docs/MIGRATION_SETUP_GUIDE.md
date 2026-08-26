# Migration & Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
Create `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/library_db"
PORT=3000
NODE_ENV=development
```

Replace with your PostgreSQL credentials.

### 3. Run Migrations
```bash
# Create database and apply schema
npx prisma migrate dev --name init

# This will:
# - Create the database
# - Create all tables with relationships
# - Generate Prisma Client
```

### 4. Start Server
```bash
npm run dev
```

Server runs on: `http://localhost:3000`

---

## 📋 Database Schema Changes

### OLD Schema (Before Enhancement)
```prisma
model Author {
  id    Int     @id @default(autoincrement())
  name  String
  books Book[]
}

model Book {
  id           Int      @id @default(autoincrement())
  title        String
  publisedDate DateTime
  authorId     Int
  author       Author   @relation(fields: [authorId], references: [id])
}
```

### NEW Schema (Enhanced)
```prisma
// Enhanced Author with timestamps and metadata
model Author {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  email     String?
  bio       String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  books     Book[]
}

// New: Publisher model
model Publisher { ... }

// New: Genre model with many-to-many
model Genre { ... }

// Enhanced Book with more fields
model Book {
  id            Int      @id @default(autoincrement())
  title         String
  description   String?
  isbn          String   @unique
  publishedDate DateTime
  pages         Int?
  price         Float?
  stock         Int      @default(1)
  authorId      Int
  publisherId   Int
  author        Author   @relation(...)
  publisher     Publisher @relation(...)
  genres        Genre[]
  reviews       Review[]
  borrowRecords BorrowRecord[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// New: Reviews with ratings
model Review { ... }

// New: LibraryMember for borrowing system
model LibraryMember { ... }

// New: BorrowRecord for tracking book loans
model BorrowRecord { ... }
```

---

## 🔄 What Changed

### Additions
| Item | Before | After |
|------|--------|-------|
| Models | 2 | 7 |
| Relationships | 1 (1-to-many) | Multiple (1-to-many, many-to-many) |
| API Endpoints | ~5 | 47+ |
| Features | Basic CRUD | Advanced (pagination, filtering, transactions) |
| Business Logic | None | Fine calculation, stock management |

### Database Tables
```
authors          (updated)
publishers       (new)
genres           (new)
books            (enhanced)
_genretobook     (implicit many-to-many junction)
reviews          (new)
librarymembers   (new)
borrowrecords    (new)
```

---

## 🔑 Key Features of New Schema

### 1. Unique Constraints
```prisma
// Author names must be unique
name String @unique

// ISBN must be unique for books
isbn String @unique

// Member email must be unique
email String @unique

// One review per member per book
@@unique([bookId, memberId])
```

### 2. Cascading Deletes
```prisma
// Deleting author deletes all their books
books Book[] @relation(onDelete: Cascade)
```

### 3. Soft Deletes
```prisma
// Members aren't hard deleted, just marked inactive
isActive Boolean @default(true)
```

### 4. Timestamps
```prisma
createdAt DateTime @default(now())    // Auto-set on creation
updatedAt DateTime @updatedAt         // Auto-updated on changes
```

### 5. Relationships

**One-to-Many**:
- Author → Books
- Publisher → Books
- Book → Reviews
- Book → BorrowRecords
- Member → Reviews
- Member → BorrowRecords

**Many-to-Many**:
- Book ↔ Genres (implicit junction table)

---

## 📊 Prisma Migrations

### What is a Migration?
A migration captures changes to your schema and applies them to the database.

### Create Migration
```bash
# After modifying schema.prisma:
npx prisma migrate dev --name description_of_change

# Example:
npx prisma migrate dev --name add_genre_to_books
```

### View Migrations
```bash
# List all migrations
ls prisma/migrations/

# See migration SQL:
cat prisma/migrations/[timestamp]_init/migration.sql
```

### Reset Database (Development Only!)
```bash
# WARNING: Deletes all data
npx prisma migrate reset

# This will:
# - Drop database
# - Create new database
# - Run all migrations
# - Run seed script (if exists)
```

---

## 🛠️ Useful Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (GUI for database)
npx prisma studio

# Validate schema
npx prisma validate

# Format schema file
npx prisma format

# See database schema
npx prisma db pull

# Push schema changes to database (without creating migrations)
npx prisma db push
```

---

## 📝 Example: Modifying Schema

### Step 1: Edit schema.prisma
```prisma
model Book {
  // ... existing fields
  language String?  // NEW FIELD
}
```

### Step 2: Create Migration
```bash
npx prisma migrate dev --name add_language_to_books
```

### Step 3: Migration file auto-generates
```sql
-- prisma/migrations/[timestamp]_add_language_to_books/migration.sql
ALTER TABLE "Book" ADD COLUMN "language" TEXT;
```

### Step 4: Applied automatically
- Database updated
- Prisma Client regenerated
- Ready to use!

---

## 🔍 Checking Your Database

### Using Prisma Studio
```bash
npx prisma studio
# Opens http://localhost:5555
```

### Using psql (PostgreSQL CLI)
```bash
# Connect to database
psql -U username -d library_db

# Show tables
\dt

# Describe table
\d "books"

# Query data
SELECT * FROM "Author";

# Exit
\q
```

---

## ⚠️ Common Issues & Solutions

### Issue: "Unable to connect to database"
```
Solution: Check DATABASE_URL in .env
- Correct username/password
- Database exists
- PostgreSQL is running
```

### Issue: "Migration failed"
```
Solution: 
1. Check migration file for syntax errors
2. Reset database: npx prisma migrate reset
3. Verify schema.prisma is valid
```

### Issue: "Relations not loading"
```
Solution: Use include() in query
const book = await prisma.book.findUnique({
  where: { id: 1 },
  include: { author: true, genres: true }
});
```

### Issue: "Unique constraint violation"
```
Solution: 
- Check for duplicate values
- Use findUnique before create
- Or use findUniqueOrThrow for better error
```

---

## 🧹 Data Seeding (Optional)

### Create seed file
`prisma/seed.js`:
```javascript
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Create authors
  const author1 = await prisma.author.create({
    data: {
      name: "Stephen King",
      email: "stephen@example.com",
      bio: "Horror writer"
    }
  });

  // Create publishers
  const publisher1 = await prisma.publisher.create({
    data: {
      name: "Penguin Books",
      country: "USA"
    }
  });

  // Create genres
  const genre1 = await prisma.genre.create({
    data: { name: "Horror" }
  });

  // Create books with relations
  await prisma.book.create({
    data: {
      title: "It",
      isbn: "978-0451191151",
      publishedDate: new Date("1986-09-15"),
      pages: 1138,
      price: 19.99,
      stock: 5,
      author: { connect: { id: author1.id } },
      publisher: { connect: { id: publisher1.id } },
      genres: { connect: [{ id: genre1.id }] }
    }
  });

  console.log("✅ Seeding completed!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

### Add to package.json
```json
{
  "scripts": {
    "seed": "node prisma/seed.js"
  }
}
```

### Run seeding
```bash
npm run seed
```

---

## 🚀 Production Deployment

### Before Production
```bash
# Test migrations
npx prisma migrate deploy

# Check connection
npx prisma db execute --file check.sql
```

### Environment Setup
```env
DATABASE_URL="postgresql://prod_user:secure_password@prod_server:5432/library_db"
NODE_ENV=production
PORT=3000
```

### Deploy Steps
1. Run migrations on production: `npx prisma migrate deploy`
2. Start application: `npm start`
3. Monitor metrics: Check `/metrics` endpoint

---

## 📚 Prisma Documentation

- [Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [CRUD Operations](https://www.prisma.io/docs/concepts/components/prisma-client/crud)
- [Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)

---

## ✅ Verification Checklist

After setup, verify:
- [ ] `.env` file created with DATABASE_URL
- [ ] `npm install` completed
- [ ] Database exists in PostgreSQL
- [ ] `npx prisma migrate dev` ran successfully
- [ ] `npm run dev` starts server without errors
- [ ] `http://localhost:3000/health` returns OK
- [ ] Can create data via API endpoints
- [ ] Can query data with relationships

---

## 🎉 You're Ready!

Your enhanced library management system is now ready to use. Start exploring the API endpoints in `API_REFERENCE.md`!

```bash
# Start developing
npm run dev

# Server running at http://localhost:3000
# Metrics at http://localhost:3000/metrics
# API documentation in API_REFERENCE.md
```

Happy coding! 🚀
