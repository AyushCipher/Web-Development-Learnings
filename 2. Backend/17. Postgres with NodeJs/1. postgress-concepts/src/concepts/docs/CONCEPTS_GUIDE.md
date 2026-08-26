# PostgreSQL Concepts - Comprehensive Guide

## Overview
This folder contains intermediate-level PostgreSQL concepts with practical examples. All files are designed for learning and interview preparation.

## File Descriptions

### 1. **basic-queries.js** - CRUD Operations
- CREATE TABLE with proper structure
- INSERT operations with parameterized queries
- SELECT/READ operations
- UPDATE operations with conditions
- DELETE operations with RETURNING clause
- Error handling and transactions basics

**Key Concepts:**
- Table creation with data types and timestamps
- Parameterized queries for security
- RETURNING clause for confirmation

---

### 2. **filtering-sorting.js** - Data Filtering & Sorting
- WHERE clause with various conditions
- ORDER BY with ASC/DESC
- LIMIT and OFFSET for pagination
- Complex filtering conditions

**Key Concepts:**
- SQL filtering best practices
- Pagination implementation
- Performance considerations for large datasets

---

### 3. **joins.js** - Relationship Queries
- INNER JOIN - Only matching records
- LEFT JOIN - Include all left table rows
- Advanced join scenarios

**Key Concepts:**
- Join types and their use cases
- Performance implications of different joins
- NULL handling in joins

---

### 4. **aggregation.js** - Aggregate Functions
- COUNT() - Count records
- AVG() - Calculate averages
- GROUP BY - Group results
- Subqueries in aggregation

**Key Concepts:**
- Aggregate function usage
- GROUP BY with multiple columns
- Having clause for filtering groups

---

### 5. **relationships.js** - Database Relationships (ENHANCED)
#### One-to-Many: Users → Posts
- Creating foreign key relationships
- Cascade delete operations
- Querying related data

#### One-to-Many: Posts → Comments
- Multi-level relationships
- Aggregating data across levels

#### Many-to-Many: Posts ↔ Tags (Junction Table)
- Creating junction/pivot tables
- UNIQUE constraints on relationships
- INSERT with ON CONFLICT
- STRING_AGG for concatenation

#### Complex Multi-Table Queries
- `getFullPostDetails()` - Combines 3+ tables with JSONB aggregation
- `getUserActivitySummary()` - 4+ table interaction with aggregation

**Key Concepts:**
- Relationship design patterns
- Foreign key constraints
- CASCADE operations
- Array and JSON aggregation

---

### 6. **transactions.js** - ACID Transactions
- Basic transaction structure (BEGIN/COMMIT/ROLLBACK)
- Savepoints for nested transactions
- Isolation levels (READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE)
- Batch operations within transactions
- Error handling and rollback strategies

**Key Concepts:**
- ACID properties implementation
- Transaction rollback on errors
- Savepoint usage for partial rollbacks
- Isolation level selection for concurrency control

**Interview Focus:**
- Explain ACID properties
- When to use different isolation levels
- Transaction deadlocks and prevention

---

### 7. **indexes-performance.js** - Query Performance Optimization
#### Index Types:
- Single column indexes
- Composite indexes
- Unique indexes
- Partial indexes (conditional)
- Full-text search indexes
- JSONB indexes
- Expression indexes

#### Performance Analysis:
- EXPLAIN plans
- EXPLAIN ANALYZE with actual stats
- Slow query identification
- Table statistics and VACUUM/ANALYZE
- Index usage monitoring

**Key Concepts:**
- When to create indexes
- Index size and maintenance cost
- Query execution plans
- Performance bottleneck identification

**Interview Focus:**
- Index selection strategies
- Trade-offs: Speed vs Storage
- Query optimization techniques

---

### 8. **subqueries-cte.js** - Advanced Query Building

#### Subqueries:
- Scalar subqueries (single value)
- IN/NOT IN subqueries
- EXISTS subqueries
- Correlated subqueries
- ALL/ANY comparison operators

#### Common Table Expressions (CTE):
- Simple CTEs (WITH clause)
- Multiple CTEs
- Recursive CTEs (hierarchical data)
- Series generation
- CTE with filtering and aggregation

**Key Concepts:**
- When to use subqueries vs JOINs
- Readability vs Performance
- Recursive patterns for hierarchical data

**Interview Focus:**
- CTE vs Subquery trade-offs
- Recursive CTE use cases
- Query complexity management

---

### 9. **window-functions.js** - Advanced Analytics
#### Window Functions:
- ROW_NUMBER() - Unique numbering
- RANK() - Ranking with gaps for ties
- DENSE_RANK() - Ranking without gaps
- LAG() / LEAD() - Previous/next row access
- SUM/AVG OVER - Running totals and moving averages
- FIRST_VALUE() / LAST_VALUE()
- PERCENT_RANK() - Percentile ranking
- NTILE() - Divide into buckets

**Key Concepts:**
- PARTITION BY for grouping
- ORDER BY within windows
- ROWS BETWEEN for sliding windows
- Frame specifications

**Interview Focus:**
- Real-world use cases (analytics, rankings)
- Performance with large datasets
- Complex window specifications

---

### 10. **string-date-functions.js** - String & Date Manipulation

#### String Functions:
- CONCAT() / || operator
- SUBSTRING() - Extract parts
- UPPER() / LOWER() - Case conversion
- LENGTH() - String length
- POSITION() / STRPOS() - Find substring
- REPLACE() - Replace content
- LTRIM() / RTRIM() / TRIM() - Whitespace removal
- REPEAT() - Repeat strings
- SPLIT_PART() - Split by delimiter

#### Date/Time Functions:
- NOW() / CURRENT_TIMESTAMP / CURRENT_DATE
- DATE_PART() - Extract components
- EXTRACT() - Alternative extraction
- DATE_TRUNC() - Truncate to precision
- INTERVAL - Date arithmetic
- AGE() - Calculate duration
- TO_CHAR() - Format dates
- TO_DATE() - Parse strings to dates

**Key Concepts:**
- Format conversions
- Date arithmetic patterns
- Timezone handling
- Performance with date filters

**Interview Focus:**
- Date filtering best practices
- Timezone considerations
- Common date calculations

---

### 11. **data-types-constraints.js** - Data Types & Validation

#### PostgreSQL Data Types:
- Numeric: INTEGER, BIGINT, DECIMAL, REAL, DOUBLE PRECISION
- String: VARCHAR, CHAR, TEXT
- Boolean
- Date/Time: DATE, TIME, TIMESTAMP
- Arrays
- JSON/JSONB
- UUID

#### Constraints:
- PRIMARY KEY - Unique identifier
- UNIQUE - Enforce uniqueness
- FOREIGN KEY - Referential integrity (CASCADE options)
- CHECK - Custom validation
- NOT NULL - Non-null requirement
- DEFAULT - Default values
- Composite constraints

**Key Concepts:**
- Type selection for performance
- Constraint enforcement
- Referential integrity
- Data validation layers

**Interview Focus:**
- JSONB vs relational approach
- Array vs separate table design
- Constraint design patterns

---

### 12. **case-union-operations.js** - Conditional Logic & Set Operations

#### CASE Statements:
- Simple CASE WHEN
- Multiple conditions
- NULL handling in CASE
- Nested CASE statements
- CASE with BETWEEN

#### Set Operations:
- UNION - Combine results (remove duplicates)
- UNION ALL - Combine results (keep all)
- INTERSECT - Common records
- EXCEPT - Records in first but not second

**Key Concepts:**
- Conditional aggregation
- Complex business logic in queries
- Set theory in SQL

**Interview Focus:**
- CASE vs database columns
- Query complexity measurement
- Set operations performance

---

### 13. **upsert-json-operations.js** - Modern PostgreSQL Features

#### UPSERT (INSERT ... ON CONFLICT):
- Simple UPSERT on unique columns
- Multi-column updates
- Conditional UPSERT logic
- Batch UPSERT operations

#### JSON Operations:
- Insert JSON data
- Query nested JSON (→, ->>)
- Update JSON fields
- JSONB array operations
- JSON to rows conversion
- JSONB containment operators
- JSON aggregation

**Key Concepts:**
- Denormalization with JSON
- When to use JSONB
- JSON performance considerations
- UPSERT use cases

**Interview Focus:**
- JSONB vs relational normalization
- UPSERT vs separate INSERT/UPDATE
- JSON indexing strategies

---

### 14. **interview-practice-queries.js** - Interview Preparation (CRITICAL)

This file contains 15 intermediate-to-advanced queries commonly asked in interviews:

#### 1. **TOP N Per Group** - Get top N records per group
```sql
-- Advanced: Window functions with CTE
ROW_NUMBER() OVER (PARTITION BY group)
```

#### 2. **Median Calculation** - Statistical queries
```sql
PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY column)
```

#### 3. **Running Difference** - Growth trend analysis
```sql
LAG() OVER (ORDER BY column) for comparisons
```

#### 4. **Pivot Tables** - Reorganize data
```sql
Conditional aggregation with CASE
```

#### 5. **Gaps and Islands** - Find consecutive sequences
```sql
Date arithmetic with ROW_NUMBER()
```

#### 6. **Self Join** - Compare rows within same table
```sql
Users who interacted together, related items
```

#### 7. **Deduplication** - Find duplicates
```sql
GROUP BY with HAVING COUNT(*) > 1
```

#### 8. **Cohort Analysis** - User retention analysis
```sql
DATE_TRUNC with complex grouping
```

#### 9. **Complex Ranking** - Multi-level ranking
```sql
RANK(), DENSE_RANK(), PERCENT_RANK(), NTILE()
```

#### 10. **Complex Aggregation** - Multiple conditions
```sql
Nested aggregates with CASE statements
```

#### 11. **Recursive Queries** - Hierarchical data (comment threads)
```sql
WITH RECURSIVE for tree structures
```

#### 12. **Advanced Analytics** - Multiple metrics
```sql
Complex joins with subqueries and aggregation
```

#### 13. **NULL Handling** - Strategic NULL management
```sql
COALESCE(), NULLIF(), CASE with NULL
```

#### 14. **Query Optimization** - Index-friendly queries
```sql
Proper WHERE clauses and filter order
```

#### 15. **Batch Operations** - Transaction-based bulk operations
```sql
BEGIN/COMMIT/ROLLBACK within loops
```

**Interview Tips:**
- Understand the "Why" behind each query
- Be able to explain execution plans
- Know trade-offs (correctness vs performance)
- Practice explaining your approach
- Think about edge cases (NULLs, empty results, large datasets)

---

## Learning Path

### Beginner → Intermediate
1. Start with `basic-queries.js` - Master CRUD
2. Learn `filtering-sorting.js` - Data retrieval
3. Study `joins.js` - Connect data
4. Practice `aggregation.js` - Data analysis
5. Understand `relationships.js` - Data modeling

### Intermediate → Advanced
1. Master `transactions.js` - Data consistency
2. Learn `indexes-performance.js` - Query optimization
3. Study `subqueries-cte.js` - Complex queries
4. Practice `window-functions.js` - Analytics
5. Build expertise with `interview-practice-queries.js`

### Across All Levels
- `string-date-functions.js` - Practical utilities
- `data-types-constraints.js` - Data integrity
- `case-union-operations.js` - Business logic
- `upsert-json-operations.js` - Modern features

---

## Interview Preparation Checklist

- [ ] Can explain 5 different JOIN types
- [ ] Can optimize a slow query using indexes
- [ ] Understand and can explain ACID properties
- [ ] Can write recursive CTEs
- [ ] Can design relationships (1:1, 1:N, N:N)
- [ ] Familiar with window functions for analytics
- [ ] Can explain EXPLAIN ANALYZE output
- [ ] Know when to use JSONB vs normalization
- [ ] Can write transaction-safe batch operations
- [ ] Solved 10+ interview-practice-queries

---

## Quick Reference

### Common Patterns

**Get Top N Per Group:**
```sql
WITH ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY group ORDER BY metric DESC) as rank
  FROM table
)
SELECT * FROM ranked WHERE rank <= N
```

**Aggregation with Multiple Conditions:**
```sql
SELECT 
  group_col,
  COUNT(CASE WHEN condition1 THEN 1 END) as count1,
  SUM(CASE WHEN condition2 THEN amount ELSE 0 END) as sum2
FROM table
GROUP BY group_col
```

**Find Duplicates:**
```sql
SELECT column, COUNT(*)
FROM table
GROUP BY column
HAVING COUNT(*) > 1
```

**Update with JOIN:**
```sql
UPDATE table1
SET column = table2.value
FROM table2
WHERE table1.id = table2.id
```

**Recursive CTE:**
```sql
WITH RECURSIVE cte AS (
  SELECT * FROM table WHERE parent IS NULL
  UNION ALL
  SELECT t.* FROM table t JOIN cte ON t.parent = cte.id
)
SELECT * FROM cte
```

---

## Performance Tips

1. **Always use WHERE on indexed columns**
2. **Use LIMIT when possible**
3. **Analyze execution plans (EXPLAIN ANALYZE)**
4. **Create indexes on frequently filtered columns**
5. **Use DISTINCT sparingly**
6. **Prefer JOINs over subqueries when possible**
7. **VACUUM and ANALYZE regularly**
8. **Use connection pooling**
9. **Batch operations when possible**
10. **Monitor slow query logs**

---

## Resources for Practice

- Practice these queries with your own data
- Modify conditions and SELECTs to understand changes
- Explain each query to someone else
- Solve similar problems with different datasets
- Time yourself and optimize for speed
- Practice under interview conditions

---

## Notes

- All code assumes a database pool connection
- Error handling should be added in production
- Security: Always use parameterized queries ($1, $2, etc.)
- Performance: Monitor execution times and adjust indexes
- Scalability: These patterns work for most use cases

Happy Learning! 🎓
