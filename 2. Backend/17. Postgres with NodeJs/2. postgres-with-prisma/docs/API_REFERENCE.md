# API Quick Reference - Library Management System

## Base URL
```
http://localhost:3000/api
```

## 🔑 Key Concepts

- **Pagination**: Use `?page=1&limit=10` on list endpoints
- **Filtering**: Use query parameters to filter results
- **Transactions**: Used for complex multi-step operations
- **Relationships**: Entities are loaded with related data using `include`

---

## 📚 AUTHOR ENDPOINTS

### Create Author
```bash
POST /authors
Body: {
  "name": "Stephen King",
  "email": "stephen@example.com",
  "bio": "American horror writer"
}
Response: Author object
```

### Get All Authors
```bash
GET /authors?page=1&limit=10
Response: {
  "data": [...],
  "total": 100,
  "page": 1,
  "pages": 10
}
```

### Get Author by ID
```bash
GET /authors/:id
Response: {
  "id": 1,
  "name": "Stephen King",
  "email": "stephen@example.com",
  "bio": "...",
  "books": [...]
}
```

### Search Authors
```bash
GET /authors/search?query=Stephen&page=1&limit=10
Searches: name, email, bio
```

### Get Prolific Authors
```bash
GET /authors/prolific?limit=10
Returns: Authors sorted by number of books
```

### Update Author
```bash
PUT /authors/:id
Body: {
  "name": "New Name",
  "email": "new@example.com",
  "bio": "Updated bio"
}
```

### Delete Author
```bash
DELETE /authors/:id
Note: Cascades to books
```

---

## 🏢 PUBLISHER ENDPOINTS

### Create Publisher
```bash
POST /publishers
Body: {
  "name": "Penguin Books",
  "email": "info@penguin.com",
  "country": "United Kingdom"
}
```

### Get All Publishers
```bash
GET /publishers?page=1&limit=10
```

### Get Publishers by Country
```bash
GET /publishers/country/United%20Kingdom?page=1&limit=10
```

### Get Publisher Details
```bash
GET /publishers/:id
Returns: Publisher with all books
```

### Update Publisher
```bash
PUT /publishers/:id
Body: { "name": "...", "email": "...", "country": "..." }
```

### Delete Publisher
```bash
DELETE /publishers/:id
```

---

## 🎭 GENRE ENDPOINTS

### Create Genre
```bash
POST /genres
Body: {
  "name": "Science Fiction",
  "description": "Futuristic stories and technology"
}
```

### Get All Genres
```bash
GET /genres?page=1&limit=10
```

### Get Genre Details
```bash
GET /genres/:id
Returns: Genre with all books
```

### Get Books in Genre
```bash
GET /genres/:id/books?page=1&limit=10
Returns: Paginated books in this genre
```

### Update Genre
```bash
PUT /genres/:id
Body: { "name": "...", "description": "..." }
```

### Delete Genre
```bash
DELETE /genres/:id
```

---

## 📖 BOOK ENDPOINTS

### Create Book
```bash
POST /books
Body: {
  "title": "It",
  "isbn": "978-0451191151",
  "description": "Epic horror novel set in Maine",
  "publishedDate": "1986-09-15",
  "pages": 1138,
  "price": 19.99,
  "stock": 5,
  "authorId": 1,
  "publisherId": 1,
  "genreIds": [1, 3]
}
```

### Get All Books
```bash
GET /books?page=1&limit=10
Optional filters:
  - authorId=1
  - publisherId=2
  - minPrice=10&maxPrice=50
  - search=title
```

### Search Books
```bash
GET /books/search?query=It&page=1&limit=10
Searches: title, description, ISBN
```

### Get Available Books
```bash
GET /books/available?page=1&limit=10
Returns: Books with stock > 0
```

### Get Book by ID
```bash
GET /books/:id
Returns: Complete book with reviews and borrow history
```

### Get Books by Author
```bash
GET /books/author/:authorId?page=1&limit=10
```

### Get Books by Publisher
```bash
GET /books/publisher/:publisherId?page=1&limit=10
```

### Get Books by Price Range
```bash
GET /books/price/:minPrice/:maxPrice?page=1&limit=10
Example: /books/price/10/50
```

### Update Book
```bash
PUT /books/:id
Body: {
  "title": "Updated Title",
  "price": 25.99,
  "stock": 3,
  ...other fields
}
```

### Add Genres to Book
```bash
PUT /books/:id/genres
Body: {
  "genreIds": [1, 2, 3]
}
Note: Replaces all genres
```

### Delete Book
```bash
DELETE /books/:id
```

---

## 👥 LIBRARY MEMBER ENDPOINTS

### Create Member
```bash
POST /members
Body: {
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, City"
}
```

### Get All Members
```bash
GET /members?page=1&limit=10
Returns: All members with borrow records and reviews
```

### Get Active Members
```bash
GET /members/active?page=1&limit=10
```

### Search Members
```bash
GET /members/search?query=Alice&page=1&limit=10
Searches: name, email
```

### Get Member Details
```bash
GET /members/:id
Returns: Member with complete borrow history and reviews
```

### Update Member
```bash
PUT /members/:id
Body: {
  "name": "...",
  "email": "...",
  "phone": "...",
  "address": "...",
  "isActive": true
}
```

### Delete/Deactivate Member
```bash
DELETE /members/:id
Note: Soft delete (sets isActive: false)
```

---

## ⭐ REVIEW ENDPOINTS

### Create Review
```bash
POST /reviews
Body: {
  "bookId": 1,
  "memberId": 1,
  "rating": 5,
  "comment": "Absolutely amazing book!"
}
Rules:
  - Rating must be 1-5
  - One review per member per book
```

### Get All Reviews
```bash
GET /reviews?page=1&limit=10
```

### Get Reviews for Book
```bash
GET /reviews/book/:bookId?page=1&limit=10
Returns: Reviews with average rating
```

### Get Book Statistics
```bash
GET /reviews/book/:bookId/stats
Returns: {
  "totalReviews": 25,
  "averageRating": 4.5,
  "ratingDistribution": {
    "1": 2,
    "2": 1,
    "3": 2,
    "4": 8,
    "5": 12
  }
}
```

### Get Member's Reviews
```bash
GET /reviews/member/:memberId?page=1&limit=10
```

### Get Reviews by Rating
```bash
GET /reviews/rating/:rating?page=1&limit=10
Example: /reviews/rating/5
```

### Update Review
```bash
PUT /reviews/:id
Body: {
  "rating": 4,
  "comment": "Updated comment"
}
```

### Delete Review
```bash
DELETE /reviews/:id
```

---

## 📅 BORROW RECORD ENDPOINTS

### Borrow a Book
```bash
POST /borrow-records/borrow
Body: {
  "bookId": 1,
  "memberId": 1
}
Business Logic:
  - Book stock must be > 0
  - Member must be active
  - Member can't borrow same book twice
  - Due date = 14 days from today
  - Stock decreases by 1
```

### Return a Book
```bash
PUT /borrow-records/:id/return
Business Logic:
  - Calculates fine if overdue
  - Fine = (days late) × 10
  - Stock increases by 1
  - Sets returnedDate
```

### Get All Borrow Records
```bash
GET /borrow-records?page=1&limit=10
```

### Get Active Borrows
```bash
GET /borrow-records/active?page=1&limit=10
Returns: Records where returnedDate is null
```

### Get Overdue Books
```bash
GET /borrow-records/overdue?page=1&limit=10
Returns: Books not returned past due date
```

### Get Library Statistics
```bash
GET /borrow-records/statistics
Returns: {
  "totalBorrows": 150,
  "activeBorrows": 25,
  "overdueBooks": 3,
  "totalFineCollected": 450,
  "mostPopularBooks": [...]
}
```

### Get Member's Borrow History
```bash
GET /borrow-records/member/:memberId?page=1&limit=10
```

### Get Book's Borrow History
```bash
GET /borrow-records/book/:bookId?page=1&limit=10
```

### Get Specific Borrow Record
```bash
GET /borrow-records/:id
```

---

## 🏥 UTILITY ENDPOINTS

### Health Check
```bash
GET /health
Response: { "status": "OK", "timestamp": "..." }
```

### Prometheus Metrics
```bash
GET /metrics
Returns: Prometheus format metrics
```

### Welcome/API Info
```bash
GET /api
Returns: API version and all endpoints
```

---

## 🎯 Complex Query Examples

### Get books by specific author with reviews
```bash
GET /books/author/1?page=1&limit=10
Response includes: all book details, reviews, and statistics
```

### Get member with complete history
```bash
GET /members/1
Response includes: 
  - Member details
  - All past borrowings
  - Currently borrowed books
  - All reviews written
```

### Get overdue books with member details
```bash
GET /borrow-records/overdue?limit=20
Response includes:
  - Member information
  - Book details
  - Days overdue
  - Fine amount
```

### Search and filter books
```bash
GET /books?search=Harry&authorId=1&minPrice=10&maxPrice=50&page=1&limit=10
```

---

## 💡 Tips & Tricks

1. **Always use pagination** for production to avoid loading huge datasets
2. **Check response structure** - all list endpoints return `{data, total, page, pages}`
3. **Transactions** automatically handle related updates (e.g., borrow decreases stock)
4. **Cascading** - deleting author deletes all their books
5. **Unique constraints** - ISBN, email, and genre names are unique
6. **Soft deletes** - members use soft delete (isActive flag)
7. **Fines calculation** - automatic when returning overdue books

---

## ✅ Status Codes Reference

| Code | Meaning |
|------|---------|
| 200  | Success (GET, PUT) |
| 201  | Created (POST) |
| 400  | Bad Request |
| 404  | Not Found |
| 500  | Server Error |

---

**Last Updated**: 2026
