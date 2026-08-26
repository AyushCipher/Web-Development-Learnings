# PostgreSQL Concepts - Complete Index

## 📚 All Concept Files (15 Total)

### Core Concepts
1. **aggregation.js** - COUNT, AVG, GROUP BY, aggregate functions
2. **basic-queries.js** - CRUD operations (CREATE, INSERT, SELECT, UPDATE, DELETE)
3. **filtering-sorting.js** - WHERE, ORDER BY, LIMIT, OFFSET (pagination)
4. **joins.js** - INNER JOIN, LEFT JOIN operations

### Intermediate Concepts  
5. **relationships.js** ⭐ **ENHANCED** - One-to-Many (2 levels), Many-to-Many (junction tables), 4+ table queries
6. **transactions.js** - ACID, BEGIN/COMMIT/ROLLBACK, Savepoints, Isolation levels
7. **indexes-performance.js** - All index types, EXPLAIN, ANALYZE, query optimization
8. **subqueries-cte.js** - Scalar subqueries, IN/EXISTS, CTEs, Recursive CTEs
9. **window-functions.js** - ROW_NUMBER, RANK, LAG/LEAD, aggregate windows

### Advanced Concepts
10. **string-date-functions.js** - CONCAT, SUBSTRING, UPPER/LOWER, DATE_TRUNC, TO_CHAR, INTERVAL
11. **data-types-constraints.js** - All PostgreSQL types, PRIMARY KEY, UNIQUE, CHECK, FOREIGN KEY, DEFAULT, JSON
12. **case-union-operations.js** - CASE statements, UNION, INTERSECT, EXCEPT
13. **upsert-json-operations.js** - INSERT ON CONFLICT, JSONB operations, JSON queries
14. **interview-practice-queries.js** ⭐ **CRITICAL** - 15 advanced interview-level queries

### Documentation
15. **CONCEPTS_GUIDE.md** - Complete guide with learning path and patterns
16. **README.md** - This index file

---

## 🎯 Quick Navigation

### By Difficulty Level

**Beginner (Start Here)**
```
1. basic-queries.js
2. filtering-sorting.js
3. aggregation.js
4. joins.js
```

**Intermediate (Core Skills)**
```
5. relationships.js
6. transactions.js
7. indexes-performance.js
8. string-date-functions.js
```

**Advanced (Master Level)**
```
9. subqueries-cte.js
10. window-functions.js
11. data-types-constraints.js
12. case-union-operations.js
13. upsert-json-operations.js
```

**Interview Prep (Practice)**
```
14. interview-practice-queries.js ⭐
```

---

## 📊 Feature Coverage

### Relationships (relationships.js) - Enhanced Version
✅ One-to-Many: Users → Posts
✅ One-to-Many: Posts → Comments  
✅ Many-to-Many: Posts ↔ Tags (with junction table)
✅ Multi-table queries (3+ tables)
✅ Complex aggregation (4+ tables)
✅ JSONB array aggregation
✅ ON CONFLICT handling

### Interview Queries (interview-practice-queries.js) - 15 Advanced Patterns
✅ Top N per group (window functions)
✅ Median calculations (percentile functions)
✅ Running totals (LAG/window functions)
✅ Pivot tables (CASE aggregation)
✅ Gaps and islands (date sequences)
✅ Self joins (relationship discovery)
✅ Deduplication (GROUP BY HAVING)
✅ Cohort analysis (retention metrics)
✅ Complex ranking (multiple ranking methods)
✅ Advanced aggregation (multiple metrics)
✅ Recursive queries (hierarchical data)
✅ Analytics queries (multi-join aggregation)
✅ NULL handling (COALESCE, NULLIF)
✅ Query optimization (index-aware)
✅ Batch operations (transactions)

---

## 🔑 Key Concepts by File

| File | Key Concepts | Interview Priority |
|------|--------------|-------------------|
| basic-queries.js | CRUD, TABLE CREATION | ⭐⭐ |
| filtering-sorting.js | WHERE, ORDER BY, PAGINATION | ⭐⭐⭐ |
| aggregation.js | COUNT, GROUP BY, HAVING | ⭐⭐⭐ |
| joins.js | INNER/LEFT/RIGHT/FULL JOINS | ⭐⭐⭐ |
| relationships.js | FOREIGN KEYS, CONSTRAINTS, MULTI-TABLE | ⭐⭐⭐ |
| transactions.js | ACID, ROLLBACK, ISOLATION LEVELS | ⭐⭐ |
| indexes-performance.js | INDEX TYPES, EXPLAIN ANALYZE | ⭐⭐⭐ |
| subqueries-cte.js | SUBQUERIES, CTE, RECURSIVE | ⭐⭐⭐ |
| window-functions.js | ROW_NUMBER, RANK, PARTITION BY | ⭐⭐⭐ |
| string-date-functions.js | STRING/DATE MANIPULATION | ⭐⭐ |
| data-types-constraints.js | TYPES, CONSTRAINTS, JSON | ⭐⭐ |
| case-union-operations.js | CASE, UNION, SET OPERATIONS | ⭐⭐ |
| upsert-json-operations.js | UPSERT, JSONB | ⭐⭐ |
| interview-practice-queries.js | ALL ADVANCED PATTERNS | ⭐⭐⭐ |

---

## 💡 Practice Workflow

### Week 1: Foundation
- [ ] Read CONCEPTS_GUIDE.md
- [ ] Practice basic-queries.js (10 times)
- [ ] Practice filtering-sorting.js (8 times)
- [ ] Practice aggregation.js (6 times)

### Week 2: Relationships & Joins
- [ ] Understand all joins.js patterns
- [ ] Master relationships.js (all 3 types)
- [ ] Practice multi-table queries
- [ ] Design your own schemas

### Week 3: Advanced Queries
- [ ] Master subqueries-cte.js
- [ ] Practice window-functions.js
- [ ] Complete transactions.js scenarios
- [ ] Understand indexes-performance.js

### Week 4: Interview Prep
- [ ] Solve interview-practice-queries.js (all 15)
- [ ] Time yourself (aim for 10-15 min per query)
- [ ] Explain each query to someone
- [ ] Create variations of each pattern

---

## 🎓 Interview Question Mapping

**These files help answer common interview questions:**

| Question | File | Function |
|----------|------|----------|
| "Design a database schema" | relationships.js | All functions |
| "Optimize this slow query" | indexes-performance.js | explainAnalyzeQuery* |
| "Get top N per group" | interview-practice-queries.js | getTopPostsPerUser |
| "Find duplicate records" | interview-practice-queries.js | findDuplicateEmails |
| "Track user retention" | interview-practice-queries.js | getUserSignupCohortRetention |
| "Calculate metrics over time" | window-functions.js | All functions |
| "Complex aggregation" | interview-practice-queries.js | getDetailedUserEngagementMetrics |
| "Transactions explained" | transactions.js | transferMoney |
| "Join explanation" | joins.js | All functions |
| "Many-to-many relationship" | relationships.js | getPostsWithTags, getFullPostDetails |

---

## 📝 SQL Patterns You'll Master

### Pattern: Ranking
```javascript
// interview-practice-queries.js
getRankedUsersWithTieHandling()
```

### Pattern: Top N Per Group  
```javascript
// interview-practice-queries.js
getTopPostsPerUser()
```

### Pattern: Running Totals
```javascript
// window-functions.js
getUserPostCount()
```

### Pattern: Recursive Hierarchy
```javascript
// subqueries-cte.js
getCategoryHierarchy()
```

### Pattern: Cohort Analysis
```javascript
// interview-practice-queries.js
getUserSignupCohortRetention()
```

### Pattern: Multi-Table Aggregation
```javascript
// relationships.js
getFullPostDetails()
getUserActivitySummary()
```

---

## 🚀 Getting Started

1. **Clone/Fork the repository**
2. **Set up PostgreSQL locally**
3. **Read CONCEPTS_GUIDE.md** - Understand the learning path
4. **Start with basic-queries.js** - Get hands-on experience
5. **Progress through intermediate files** - Build skills
6. **Practice interview-practice-queries.js** - Prepare for interviews
7. **Create your own variations** - Master the patterns

---

## ✅ Completion Checklist

After going through all files, you should be able to:

- [ ] Write any CRUD operation
- [ ] Design efficient database schemas
- [ ] Write complex JOINs with 5+ tables
- [ ] Optimize queries using indexes
- [ ] Explain ACID properties
- [ ] Use window functions for analytics
- [ ] Write recursive CTEs
- [ ] Handle transactions and rollbacks
- [ ] Solve all 15 interview practice queries
- [ ] Explain EXPLAIN ANALYZE output
- [ ] Design Many-to-Many relationships
- [ ] Use JSONB for flexible data
- [ ] Write batch operations safely
- [ ] Answer common database interview questions

---

## 📈 File Statistics

| File | Functions | Code Lines | Difficulty |
|------|-----------|-----------|-----------|
| basic-queries.js | 5 | 95 | Beginner |
| filtering-sorting.js | 3 | 50 | Beginner |
| aggregation.js | 2 | 45 | Beginner |
| joins.js | 2 | 40 | Beginner |
| relationships.js | 12 | 250 | Intermediate |
| transactions.js | 5 | 180 | Intermediate |
| indexes-performance.js | 12 | 280 | Intermediate |
| subqueries-cte.js | 11 | 240 | Intermediate |
| window-functions.js | 13 | 320 | Advanced |
| string-date-functions.js | 19 | 310 | Intermediate |
| data-types-constraints.js | 14 | 280 | Intermediate |
| case-union-operations.js | 10 | 200 | Intermediate |
| upsert-json-operations.js | 10 | 240 | Advanced |
| interview-practice-queries.js | 15 | 400 | Advanced |
| **TOTAL** | **143** | **3,130** | **Comprehensive** |

---

## 🎉 Key Highlights

✨ **relationships.js** - Now includes:
- 3 different relationship types (1:M, 1:M, M:M)
- Multi-table queries with 4+ tables
- Real-world scenarios (users, posts, comments, tags)

✨ **interview-practice-queries.js** - Contains:
- 15 advanced queries covering all interview patterns
- Real-world scenarios
- Optimized for learning and practice

✨ **Complete Coverage**:
- All basic PostgreSQL concepts
- Intermediate patterns and best practices
- Advanced analytics and window functions
- Interview-ready practice questions

---

Happy Learning! 🚀

**For detailed information on each file, see CONCEPTS_GUIDE.md**
