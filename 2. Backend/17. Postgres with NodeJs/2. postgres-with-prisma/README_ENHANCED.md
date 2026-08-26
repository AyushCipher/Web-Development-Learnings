# Library Management System - Intermediate Postgres + Prisma Project

A comprehensive backend API for a library management system built with Node.js, Express, PostgreSQL, and Prisma ORM. This project demonstrates intermediate-level Postgres usage with advanced Prisma features.

## 🚀 Features

- **Complete CRUD Operations** for all entities
- **Advanced Relationships**:
  - One-to-Many (Authors → Books, Publishers → Books)
  - Many-to-Many (Genres ↔ Books)
  - Cascading operations
- **Pagination & Filtering** for all list endpoints
- **Transaction Support** for complex operations
- **Book Borrowing System** with fine calculation
- **Review & Rating System**
- **Search Functionality** across multiple fields
- **Library Statistics** and analytics
- **Prometheus Metrics** for monitoring

## 📦 Project Structure

```
src/
├── controllers/      # Request handlers
├── services/        # Business logic & database operations
├── routes/          # API route definitions
└── server.js        # Express app setup

prisma/
├── migrations/      # Database migration files
└── schema.prisma    # Database schema definition
```

## 🗄️ Database Models

### 1. **Author**
- Unique name and email
- Biography
- One-to-many relationship with Books
- Track creation/update timestamps

### 2. **Publisher**
- Unique name
- Email and country
- One-to-many relationship with Books

### 3. **Genre**
- Unique name
- Description
- Many-to-many relationship with Books

### 4. **Book**
- Title, ISBN (unique), description
- Published date, pages, price, stock
- Relationships: Author, Publisher, Genres
- One-to-many relationships: Reviews, BorrowRecords
- Track creation/update timestamps

### 5. **Review**
- Rating (1-5 stars)
- Comment
- Relationships: Book, LibraryMember
- Unique constraint: One review per member per book

### 6. **LibraryMember**
- Name, email (unique), phone, address
- Membership date, active status
- Relationships: Reviews, BorrowRecords

### 7. **BorrowRecord**
- Borrow date, due date, returned date
- Fine calculation for overdue books
- Relationships: Book, LibraryMember

## 📚 API Endpoints

### Authors
```
POST   /api/authors                    # Create author
GET    /api/authors                    # Get all authors (paginated)
GET    /api/authors/prolific           # Get authors with most books
GET    /api/authors/search?query=      # Search authors
GET    /api/authors/:id                # Get author by ID
PUT    /api/authors/:id                # Update author
DELETE /api/authors/:id                # Delete author
```

### Publishers
```
POST   /api/publishers                 # Create publisher
GET    /api/publishers                 # Get all publishers (paginated)
GET    /api/publishers/country/:country # Get publishers by country
GET    /api/publishers/:id             # Get publisher by ID
PUT    /api/publishers/:id             # Update publisher
DELETE /api/publishers/:id             # Delete publisher
```

### Genres
```
POST   /api/genres                     # Create genre
GET    /api/genres                     # Get all genres (paginated)
GET    /api/genres/:id                 # Get genre by ID
GET    /api/genres/:id/books           # Get books in genre
PUT    /api/genres/:id                 # Update genre
DELETE /api/genres/:id                 # Delete genre
```

### Books
```
POST   /api/books                      # Create book
GET    /api/books                      # Get all books (paginated, filterable)
GET    /api/books/search?query=        # Search books
GET    /api/books/available            # Get books in stock
GET    /api/books/author/:authorId     # Get books by author
GET    /api/books/publisher/:publisherId # Get books by publisher
GET    /api/books/price/:min/:max      # Get books in price range
GET    /api/books/:id                  # Get book by ID
PUT    /api/books/:id                  # Update book
PUT    /api/books/:id/genres           # Add genres to book
DELETE /api/books/:id                  # Delete book
```

### Library Members
```
POST   /api/members                    # Create member
GET    /api/members                    # Get all members (paginated)
GET    /api/members/active             # Get active members
GET    /api/members/search?query=      # Search members
GET    /api/members/:id                # Get member by ID
PUT    /api/members/:id                # Update member
DELETE /api/members/:id                # Deactivate member
```

### Reviews
```
POST   /api/reviews                    # Create review
GET    /api/reviews                    # Get all reviews (paginated)
GET    /api/reviews/book/:bookId       # Get reviews for book
GET    /api/reviews/book/:bookId/stats # Get book rating statistics
GET    /api/reviews/member/:memberId   # Get member's reviews
GET    /api/reviews/rating/:rating     # Get reviews by rating
PUT    /api/reviews/:id                # Update review
DELETE /api/reviews/:id                # Delete review
```

### Borrow Records
```
POST   /api/borrow-records/borrow      # Borrow a book
PUT    /api/borrow-records/:id/return  # Return a book (calculates fines)
GET    /api/borrow-records             # Get all borrow records
GET    /api/borrow-records/active      # Get active borrows
GET    /api/borrow-records/overdue     # Get overdue books
GET    /api/borrow-records/statistics  # Get library statistics
GET    /api/borrow-records/member/:id  # Get member's borrow history
GET    /api/borrow-records/book/:id    # Get book's borrow history
GET    /api/borrow-records/:id         # Get borrow record by ID
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
npm install
```

2. **Set up environment variables**
Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/library_db"
PORT=3000
NODE_ENV=development
```

3. **Run Prisma migrations**
```bash
npx prisma migrate dev --name init
```

4. **Start the server**
```bash
npm run dev
```

Server will run at `http://localhost:3000`

## 📝 Example Requests

### Create an Author
```bash
POST /api/authors
Content-Type: application/json

{
  "name": "J.K. Rowling",
  "email": "jk@example.com",
  "bio": "British author of Harry Potter series"
}
```

### Create a Publisher
```bash
POST /api/publishers
Content-Type: application/json

{
  "name": "Bloomsbury Publishing",
  "email": "info@bloomsbury.com",
  "country": "United Kingdom"
}
```

### Create a Genre
```bash
POST /api/genres
Content-Type: application/json

{
  "name": "Fantasy",
  "description": "Fantasy and magical adventures"
}
```

### Create a Book
```bash
POST /api/books
Content-Type: application/json

{
  "title": "Harry Potter and the Philosopher's Stone",
  "isbn": "978-0747532699",
  "description": "The first book in the Harry Potter series",
  "publishedDate": "1998-06-26",
  "pages": 309,
  "price": 29.99,
  "stock": 5,
  "authorId": 1,
  "publisherId": 1,
  "genreIds": [1]
}
```

### Add Genres to Book
```bash
PUT /api/books/1/genres
Content-Type: application/json

{
  "genreIds": [1, 2]
}
```

### Create a Library Member
```bash
POST /api/members
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, City"
}
```

### Borrow a Book
```bash
POST /api/borrow-records/borrow
Content-Type: application/json

{
  "bookId": 1,
  "memberId": 1
}
```

### Return a Book (Calculates Fine if Overdue)
```bash
PUT /api/borrow-records/1/return
```

### Create a Review
```bash
POST /api/reviews
Content-Type: application/json

{
  "bookId": 1,
  "memberId": 1,
  "rating": 5,
  "comment": "Amazing book! Highly recommended"
}
```

### Search Books
```bash
GET /api/books/search?query=Harry&page=1&limit=10
```

### Get Books by Price Range
```bash
GET /api/books/price/10/50?page=1&limit=10
```

### Get Library Statistics
```bash
GET /api/borrow-records/statistics
```

## 🎯 Advanced Features

### Pagination
All list endpoints support pagination:
```bash
GET /api/books?page=1&limit=10
```

Response includes:
- `data`: Array of items
- `total`: Total count
- `page`: Current page
- `pages`: Total pages

### Filtering
Books endpoint supports filtering:
```bash
GET /api/books?authorId=1&publisherId=1&minPrice=10&maxPrice=50
```

### Transactions
Prisma transactions are used for:
- Updating book stock when borrowing/returning
- Checking duplicate reviews
- Complex multi-step operations

### Search
Full-text search on multiple fields:
- Authors: name, email, bio
- Books: title, description, ISBN
- Members: name, email

## 📊 Monitoring

- Prometheus metrics available at `/metrics`
- Health check endpoint at `/health`

## 🔑 Key Learning Points

This project demonstrates:

1. **Prisma ORM Mastery**
   - Relationships (1-to-many, many-to-many)
   - Transactions
   - Aggregations
   - Pagination

2. **Advanced Database Patterns**
   - Cascading deletes
   - Unique constraints
   - Complex queries

3. **Business Logic**
   - Fine calculation for overdue books
   - Stock management
   - One review per member per book

4. **API Design**
   - RESTful conventions
   - Proper HTTP status codes
   - Pagination and filtering
   - Error handling

5. **Performance Optimization**
   - Efficient queries with includes
   - Pagination to avoid loading all data
   - Parallel queries with Promise.all

## 📦 Dependencies

- `express`: Web framework
- `@prisma/client`: ORM
- `prisma`: CLI & schema builder
- `dotenv`: Environment variables
- `prom-client`: Prometheus metrics

## 🚦 Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad request
- `404`: Not found
- `500`: Server error

## 💡 Future Enhancements

- Authentication & Authorization
- Request validation middleware
- API documentation with Swagger
- Rate limiting
- Caching with Redis
- Email notifications
- Advanced reporting
- API versioning

## 📄 License

ISC

## 🤝 Contributing

Feel free to fork and submit pull requests for any improvements!

---

**Happy coding!** 🎉
