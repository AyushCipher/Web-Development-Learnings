# Real-World Usage Examples

Practical examples demonstrating how to use the Library Management System API for common scenarios.

---

## 📖 Scenario 1: New Book Launch

Adding a new book to the library with all details.

### Step 1: Ensure Author Exists
```bash
POST /api/authors
Body: {
  "name": "J.R.R. Tolkien",
  "email": "tolkien@example.com",
  "bio": "British philologist and author"
}
Response: { "id": 1, "name": "J.R.R. Tolkien", ... }
```

### Step 2: Ensure Publisher Exists
```bash
POST /api/publishers
Body: {
  "name": "Allen & Unwin",
  "email": "info@allen-unwin.com",
  "country": "United Kingdom"
}
Response: { "id": 1, "name": "Allen & Unwin", ... }
```

### Step 3: Create Genres
```bash
POST /api/genres
Body: {
  "name": "Fantasy",
  "description": "Fictional worlds and magical adventures"
}
Response: { "id": 1, "name": "Fantasy" }

POST /api/genres
Body: {
  "name": "Adventure",
  "description": "Epic journeys and quests"
}
Response: { "id": 2, "name": "Adventure" }
```

### Step 4: Create Book
```bash
POST /api/books
Body: {
  "title": "The Lord of the Rings: The Fellowship of the Ring",
  "isbn": "978-0-618-00221-3",
  "description": "The beginning of an epic journey",
  "publishedDate": "1954-07-29",
  "pages": 423,
  "price": 29.99,
  "stock": 10,
  "authorId": 1,
  "publisherId": 1,
  "genreIds": [1, 2]
}
Response: {
  "id": 1,
  "title": "The Lord of the Rings...",
  "author": { "id": 1, "name": "J.R.R. Tolkien" },
  "publisher": { "id": 1, "name": "Allen & Unwin" },
  "genres": [
    { "id": 1, "name": "Fantasy" },
    { "id": 2, "name": "Adventure" }
  ]
}
```

---

## 👥 Scenario 2: Member Registration & Borrowing

A new member joins and borrows a book.

### Step 1: Register Member
```bash
POST /api/members
Body: {
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "+1-555-0123",
  "address": "123 Main Street, Anytown, USA"
}
Response: {
  "id": 1,
  "name": "Alice Johnson",
  "membershipDate": "2026-06-02T10:30:00Z",
  "isActive": true
}
```

### Step 2: Borrow Book
```bash
POST /api/borrow-records/borrow
Body: {
  "bookId": 1,
  "memberId": 1
}
Response: {
  "id": 1,
  "borrowDate": "2026-06-02T10:35:00Z",
  "dueDate": "2026-06-16T10:35:00Z",  // 14 days later
  "returnedDate": null,
  "fine": 0,
  "book": { "id": 1, "title": "The Lord of the Rings...", "stock": 9 },
  "member": { "id": 1, "name": "Alice Johnson" }
}
```

### Step 3: Check Borrow History
```bash
GET /api/borrow-records/member/1
Response: {
  "data": [
    {
      "id": 1,
      "borrowDate": "2026-06-02...",
      "dueDate": "2026-06-16...",
      "returnedDate": null,
      "book": { ... }
    }
  ],
  "total": 1,
  "page": 1,
  "pages": 1
}
```

---

## ⭐ Scenario 3: Review & Rating System

Member finishes book and leaves a review.

### Step 1: Return Book
```bash
PUT /api/borrow-records/1/return
Response: {
  "id": 1,
  "borrowDate": "2026-06-02...",
  "dueDate": "2026-06-16...",
  "returnedDate": "2026-06-15T14:20:00Z",  // 1 day early
  "fine": 0,  // No fine, returned on time
  "book": { "id": 1, "title": "...", "stock": 10 }
}
```

### Step 2: Write Review
```bash
POST /api/reviews
Body: {
  "bookId": 1,
  "memberId": 1,
  "rating": 5,
  "comment": "An absolute masterpiece! Took me on an unforgettable journey."
}
Response: {
  "id": 1,
  "rating": 5,
  "comment": "An absolute masterpiece...",
  "book": { "id": 1, "title": "The Lord of the Rings..." },
  "member": { "id": 1, "name": "Alice Johnson" },
  "createdAt": "2026-06-15T14:25:00Z"
}
```

### Step 3: Check Book Statistics
```bash
GET /api/reviews/book/1/stats
Response: {
  "totalReviews": 3,
  "averageRating": 4.67,
  "ratingDistribution": {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 1,
    "5": 2
  }
}
```

### Step 4: Get Reviews for Book
```bash
GET /api/reviews/book/1?page=1&limit=10
Response: {
  "data": [
    {
      "id": 1,
      "rating": 5,
      "comment": "An absolute masterpiece...",
      "member": { "name": "Alice Johnson" },
      "createdAt": "..."
    },
    // ... more reviews
  ],
  "averageRating": 4.67,
  "totalReviews": 3,
  "page": 1,
  "pages": 1
}
```

---

## 🔍 Scenario 4: Library Search & Discovery

Finding books by various criteria.

### Option 1: Search by Title
```bash
GET /api/books/search?query=Lord&page=1&limit=10
Response: Books matching "Lord" in title or description
```

### Option 2: Browse by Genre
```bash
GET /api/genres/1/books?page=1&limit=10
Response: All "Fantasy" books with pagination
```

### Option 3: Books by Author
```bash
GET /api/books/author/1?page=1&limit=20
Response: All books by J.R.R. Tolkien
```

### Option 4: Filter by Price Range
```bash
GET /api/books/price/10/40?page=1&limit=10
Response: Books between $10-$40
```

### Option 5: Available Books Only
```bash
GET /api/books/available?page=1&limit=10
Response: Books with stock > 0
```

### Option 6: Complex Filtering
```bash
GET /api/books?
  search=ring&
  authorId=1&
  minPrice=20&
  maxPrice=50&
  page=1&
  limit=10
Response: Books matching all criteria
```

---

## 📊 Scenario 5: Library Management Reports

Generating reports for library operations.

### Report 1: Overdue Books
```bash
GET /api/borrow-records/overdue?page=1&limit=20
Response: {
  "data": [
    {
      "id": 5,
      "member": { "name": "Bob Smith", "email": "bob@example.com" },
      "book": { "title": "..." },
      "dueDate": "2026-05-25",
      "returnedDate": null,
      "fine": 0  // Not yet calculated
    }
  ],
  "total": 3,
  "pages": 1
}
```

### Report 2: Library Statistics
```bash
GET /api/borrow-records/statistics
Response: {
  "totalBorrows": 150,
  "activeBorrows": 25,
  "overdueBooks": 3,
  "totalFineCollected": 450,
  "mostPopularBooks": [
    { "bookId": 1, "_count": { "id": 45 } },
    { "bookId": 2, "_count": { "id": 38 } }
  ]
}
```

### Report 3: Active Members
```bash
GET /api/members/active?page=1&limit=50
Response: Paginated list of active members
```

### Report 4: Prolific Authors
```bash
GET /api/authors/prolific?limit=10
Response: Authors with most books in system
```

### Report 5: Member Activity
```bash
GET /api/members/1
Response: Member with complete history
{
  "id": 1,
  "name": "Alice Johnson",
  "borrowRecords": [
    { "book": {...}, "borrowDate": "...", "returnedDate": "..." },
    { "book": {...}, "borrowDate": "...", "returnedDate": null }
  ],
  "reviews": [
    { "book": {...}, "rating": 5 }
  ]
}
```

---

## 🔧 Scenario 6: Overdue Book Management

Handling overdue books and fines.

### Step 1: Find Overdue Books
```bash
GET /api/borrow-records/overdue?limit=10
Response: List of all overdue books
```

### Step 2: Check Specific Overdue Record
```bash
GET /api/borrow-records/5
Response: {
  "id": 5,
  "member": { "name": "Bob Smith", "email": "bob@example.com" },
  "book": { "title": "The Hobbit" },
  "borrowDate": "2026-05-10",
  "dueDate": "2026-05-24",
  "returnedDate": null,
  "fine": 0  // Not calculated yet
}
```

### Step 3: Member Returns Overdue Book
```bash
PUT /api/borrow-records/5/return
Response: {
  "id": 5,
  "returnedDate": "2026-06-02T10:00:00Z",
  "fine": 90  // (2026-06-02 - 2026-05-24) * 10 = 9 days * 10 = 90
  // 9 days late at 10 per day
}
```

### Step 4: Send Fine Notice (Application Level)
```
For each overdue book return:
- Send email to member with fine amount
- Update member account with fine
- Record transaction
```

---

## 🏢 Scenario 7: Publisher Management

Managing multiple publishers and their books.

### Create Multiple Publishers
```bash
POST /api/publishers
Body: { "name": "Penguin", "country": "UK" }
POST /api/publishers
Body: { "name": "Random House", "country": "USA" }
POST /api/publishers
Body: { "name": "HachetteLivre", "country": "France" }
```

### Filter Publishers by Country
```bash
GET /api/publishers/country/USA?page=1&limit=10
Response: All American publishers
```

### View Publisher Catalog
```bash
GET /api/books/publisher/2?page=1&limit=20
Response: All books from Random House
```

### Update Publisher Info
```bash
PUT /api/publishers/2
Body: {
  "name": "Random House (Updated)",
  "email": "new@randomhouse.com",
  "country": "USA"
}
```

---

## 🎯 Scenario 8: Genre Management

Managing book categories.

### Create Multiple Genres
```bash
POST /api/genres { "name": "Science Fiction" }
POST /api/genres { "name": "Mystery" }
POST /api/genres { "name": "Romance" }
```

### View All Genres
```bash
GET /api/genres?page=1&limit=50
```

### Browse Books in Genre
```bash
GET /api/genres/3/books?page=1&limit=20
Response: All "Mystery" books
```

### Add Genres to Existing Book
```bash
PUT /api/books/1/genres
Body: {
  "genreIds": [1, 3, 5]  // Fantasy, Adventure, Science Fiction
}
```

---

## 🔐 Scenario 9: Member Profile Management

Complete member lifecycle management.

### Register New Member
```bash
POST /api/members
Body: {
  "name": "Charlie Brown",
  "email": "charlie@example.com",
  "phone": "+1-555-0456",
  "address": "456 Oak Ave, Somewhere"
}
```

### Search Members
```bash
GET /api/members/search?query=Charlie&page=1&limit=10
```

### Update Member Profile
```bash
PUT /api/members/2
Body: {
  "name": "Charles Brown",
  "phone": "+1-555-0789",
  "address": "789 Elm St, Somewhere Else"
}
```

### Deactivate Member
```bash
DELETE /api/members/2
Note: Soft delete (sets isActive: false)
```

### Reactivate Member
```bash
PUT /api/members/2
Body: { "isActive": true }
```

---

## 📈 Scenario 10: Data Analytics

Extracting insights from library data.

### Identify Top Rated Books
```bash
GET /api/reviews?page=1&limit=10
// Sort manually or create custom endpoint
// Books with rating >= 4.5
```

### Find Loyal Members
```bash
GET /api/members/1  // Check borrowRecords length
// Members with > 10 borrow records
```

### Track Popular Authors
```bash
GET /api/authors/prolific?limit=10
// Authors with most books
```

### Analyze Fine Collection
```bash
GET /api/borrow-records/statistics
// totalFineCollected: shows total fines paid
```

---

## 💡 Pro Tips

### Tip 1: Always Use Pagination
```bash
# Wrong - might load thousands of records
GET /api/books

# Right - paginated
GET /api/books?page=1&limit=20
```

### Tip 2: Filter Early
```bash
# Wrong - fetch all then filter
GET /api/books
// filter in app

# Right - filter in database
GET /api/books?authorId=1&minPrice=10&maxPrice=50
```

### Tip 3: Use Search for User Input
```bash
# User searching for "Lord"
GET /api/books/search?query=Lord
```

### Tip 4: Check Response Structure
```javascript
// All list responses have same structure
{
  "data": [...],      // Array of items
  "total": 150,       // Total count (ignoring pagination)
  "page": 1,          // Current page
  "pages": 15         // Total pages
}
```

### Tip 5: Handle Errors Gracefully
```javascript
try {
  const response = await fetch('/api/books/999');
  if (!response.ok) {
    // Handle 404 or other errors
    console.error('Book not found');
  }
} catch (error) {
  // Handle network errors
  console.error('Network error:', error);
}
```

---

## 🚀 Integration Example

### Complete Workflow Using All Systems
```javascript
// 1. Admin creates book setup
await createAuthor("J.K. Rowling");
await createPublisher("Bloomsbury");
await createGenre("Fantasy");
await createBook(authorId, publisherId, [genreId]);

// 2. Member joins
await createMember("Emma Watson");

// 3. Member borrows book
await borrowBook(bookId, memberId);

// 4. Member reads and returns
await returnBook(borrowRecordId);

// 5. Member leaves review
await createReview(bookId, memberId, 5, "Amazing!");

// 6. Library generates reports
await getLibraryStatistics();
await getOverdueBooks();
await getBookStatistics(bookId);
```

---

**These examples demonstrate the full power of the Library Management System. Mix and match endpoints to build your application!**
