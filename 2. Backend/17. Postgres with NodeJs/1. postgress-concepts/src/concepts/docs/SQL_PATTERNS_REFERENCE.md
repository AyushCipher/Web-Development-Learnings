# PostgreSQL Advanced Patterns - Quick Reference

## Complete Index of Patterns by Category

### 🎯 **RANKING & NUMBERING**

#### Pattern: Top N Per Group
**File:** interview-practice-queries.js → `getTopPostsPerUser()`
```sql
WITH ranked_posts AS (
  SELECT 
    username,
    post_id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY comment_count DESC) as rank
  FROM posts_data
)
SELECT * FROM ranked_posts WHERE rank <= 3
```

#### Pattern: Multiple Ranking Methods
**File:** interview-practice-queries.js → `getRankedUsersWithTieHandling()`
```sql
SELECT 
  username,
  RANK() OVER (ORDER BY metric DESC) as rank,
  DENSE_RANK() OVER (ORDER BY metric DESC) as dense_rank,
  PERCENT_RANK() OVER (ORDER BY metric DESC) as percent_rank,
  NTILE(4) OVER (ORDER BY metric DESC) as quartile
FROM data
```

---

### 📈 **TIME SERIES & TRENDS**

#### Pattern: Growth Rate Analysis  
**File:** interview-practice-queries.js → `getUserPostGrowthTrend()`
```sql
SELECT 
  DATE_TRUNC('day', created_at)::DATE as date,
  COUNT(*) as count_today,
  LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', created_at)) as count_yesterday,
  COUNT(*) - LAG(COUNT(*)) OVER (...) as daily_growth
FROM posts
GROUP BY DATE_TRUNC('day', created_at)
```

#### Pattern: Moving Average
**File:** window-functions.js → `getPostCommentMovingAverage()`
```sql
SELECT 
  id,
  AVG(value) OVER (
    ORDER BY date 
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ) as moving_avg
FROM data
```

#### Pattern: Consecutive Sequences (Gaps & Islands)
**File:** interview-practice-queries.js → `getUserPostingStreaks()`
```sql
WITH with_gaps AS (
  SELECT 
    id,
    date,
    date - ROW_NUMBER() OVER (ORDER BY date) as island
  FROM data
)
SELECT 
  MIN(date) as streak_start,
  MAX(date) as streak_end,
  COUNT(*) as consecutive_days
FROM with_gaps
GROUP BY island
HAVING COUNT(*) >= 3
```

---

### 🔗 **RELATIONSHIPS**

#### Pattern: One-to-Many (Single Level)
**File:** relationships.js → `createPostsTable()`, `getPostsByUserId()`
```sql
-- Create
CREATE TABLE posts(
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
)

-- Query
SELECT u.username, p.title FROM users u
JOIN posts p ON u.id = p.user_id
```

#### Pattern: Many-to-Many with Junction Table
**File:** relationships.js → `createPostTagsJunctionTable()`, `getPostsWithTags()`
```sql
-- Create
CREATE TABLE post_tags(
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(post_id, tag_id)
)

-- Query with aggregation
SELECT p.id, p.title,
  STRING_AGG(t.name, ', ') as tags
FROM posts p
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
GROUP BY p.id, p.title
```

#### Pattern: Complex Multi-Table Query (3+ Tables)
**File:** relationships.js → `getFullPostDetails()`, `getUserActivitySummary()`
```sql
SELECT 
  p.id, p.title,
  ARRAY_AGG(DISTINCT jsonb_build_object(
    'comment', c.content, 'by', cu.username
  )) as comments,
  ARRAY_AGG(DISTINCT t.name) as tags
FROM posts p
JOIN users u ON p.user_id = u.id
LEFT JOIN comments c ON p.id = c.post_id
LEFT JOIN users cu ON c.user_id = cu.id
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.id = $1
GROUP BY p.id, p.title, u.username, u.email
```

---

### 💾 **TRANSACTIONS**

#### Pattern: Money Transfer (Atomicity)
**File:** transactions.js → `transferMoney()`
```sql
BEGIN;
  UPDATE accounts SET balance = balance - $1 WHERE id = $2;
  UPDATE accounts SET balance = balance + $1 WHERE id = $3;
  INSERT INTO transaction_logs VALUES (...);
COMMIT;
-- OR ROLLBACK on error
```

#### Pattern: Savepoints (Partial Rollback)
**File:** transactions.js → `complexDataOperation()`
```sql
BEGIN;
  INSERT INTO users VALUES (...);
  SAVEPOINT sp_before_posts;
  BEGIN
    INSERT INTO posts VALUES (...);
  EXCEPTION WHEN condition THEN
    ROLLBACK TO SAVEPOINT sp_before_posts;
  END;
COMMIT;
```

#### Pattern: Batch Operations with Transaction
**File:** transactions.js → `batchUpdateUserAccounts()`
```sql
BEGIN;
  FOR each item IN array LOOP
    UPDATE table SET column = value WHERE id = item.id;
  END LOOP;
COMMIT;
```

---

### 🔍 **AGGREGATION & ANALYTICS**

#### Pattern: Complex Aggregation with Multiple Conditions
**File:** interview-practice-queries.js → `getDetailedUserEngagementMetrics()`
```sql
SELECT 
  user_id,
  COUNT(DISTINCT posts) as total_posts,
  COUNT(DISTINCT CASE WHEN date > now - 30d THEN id END) as recent_posts,
  ROUND(AVG(CASE WHEN comments IS NOT NULL THEN 1 ELSE 0 END)::NUMERIC, 2) as engagement_score
FROM data
GROUP BY user_id
```

#### Pattern: Find Duplicates
**File:** interview-practice-queries.js → `findDuplicateEmails()`
```sql
SELECT 
  email,
  COUNT(*) as occurrence,
  ARRAY_AGG(id) as ids
FROM users
GROUP BY email
HAVING COUNT(*) > 1
```

#### Pattern: Pivot Table (Dynamic Cross-tab)
**File:** interview-practice-queries.js → `getUserEngagementPivot()`
```sql
SELECT 
  CASE WHEN posts >= 20 THEN 'High' 
       WHEN posts >= 10 THEN 'Medium' 
       ELSE 'Low' END as level,
  COUNT(*) as user_count,
  AVG(posts) as avg_posts
FROM user_stats
GROUP BY engagement_level
```

---

### 🔗 **SUBQUERIES & CTEs**

#### Pattern: Scalar Subquery
**File:** subqueries-cte.js → `getPostsWithCommentCount()`
```sql
SELECT 
  p.id,
  (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
  (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND created_at > now - 30d) as recent_comments
FROM posts p
```

#### Pattern: CTE with Multiple References
**File:** subqueries-cte.js → `getUserEngagementStats()`
```sql
WITH user_posts AS (
  SELECT user_id, COUNT(*) as total_posts FROM posts GROUP BY user_id
),
user_comments AS (
  SELECT user_id, COUNT(*) as total_comments FROM comments GROUP BY user_id
)
SELECT 
  u.id,
  COALESCE(up.total_posts, 0) as posts,
  COALESCE(uc.total_comments, 0) as comments
FROM users u
LEFT JOIN user_posts up ON u.id = up.user_id
LEFT JOIN user_comments uc ON u.id = uc.user_id
```

#### Pattern: Recursive CTE (Hierarchical)
**File:** subqueries-cte.js → `getCategoryHierarchy()`
```sql
WITH RECURSIVE category_tree AS (
  -- Base case
  SELECT id, name, parent_id, 0 as level FROM categories WHERE parent_id IS NULL
  
  UNION ALL
  
  -- Recursive case
  SELECT c.id, c.name, c.parent_id, ct.level + 1
  FROM categories c
  JOIN category_tree ct ON c.parent_id = ct.id
  WHERE ct.level < 10
)
SELECT * FROM category_tree
```

---

### 🪟 **WINDOW FUNCTIONS**

#### Pattern: Partitioned Aggregation
**File:** window-functions.js → `getUserPostRanking()`
```sql
SELECT 
  username,
  title,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as post_number,
  RANK() OVER (PARTITION BY user_id ORDER BY comment_count DESC) as rank
FROM posts
```

#### Pattern: Access Previous/Next Row
**File:** window-functions.js → `getUserPostTimeline()`
```sql
SELECT 
  username,
  created_at,
  LAG(created_at) OVER (PARTITION BY user_id ORDER BY created_at) as previous_date,
  LEAD(created_at) OVER (PARTITION BY user_id ORDER BY created_at) as next_date,
  EXTRACT(DAY FROM created_at - LAG(created_at) OVER (...)) as days_since_last
FROM posts
```

#### Pattern: Running Total
**File:** window-functions.js → `getUserPostCount()`
```sql
SELECT 
  username,
  SUM(1) OVER (PARTITION BY user_id ORDER BY created_at) as cumulative_posts,
  COUNT(1) OVER (PARTITION BY user_id) as total_posts
FROM posts
```

---

### 📊 **SET OPERATIONS**

#### Pattern: UNION (Remove Duplicates)
**File:** case-union-operations.js → `getActivePeopleUnion()`
```sql
SELECT username, email FROM users WHERE created_at > now - 30d
UNION
SELECT username, email FROM users WHERE exists (SELECT 1 FROM posts where user_id = users.id)
ORDER BY username
```

#### Pattern: UNION ALL (Keep All)
**File:** case-union-operations.js → `getUsersAndPostsCountUnionAll()`
```sql
SELECT u.id, COUNT(*) FROM users u GROUP BY u.id
UNION ALL
SELECT u.id, COUNT(*) FROM users u JOIN posts p ON u.id = p.user_id GROUP BY u.id
```

#### Pattern: INTERSECT (Common)
**File:** case-union-operations.js → `getCommonUserEmailDomains()`
```sql
SELECT domain FROM users WHERE created_at > now - 90d
INTERSECT
SELECT domain FROM users WHERE exists (SELECT 1 FROM posts)
```

#### Pattern: EXCEPT (Difference)
**File:** case-union-operations.js → `getUsersWithoutActivity()`
```sql
SELECT id, username FROM users
EXCEPT
SELECT DISTINCT u.id, u.username FROM users u
WHERE exists (SELECT 1 FROM posts where user_id = u.id)
```

---

### ⚡ **PERFORMANCE OPTIMIZATION**

#### Pattern: Index Strategy
**File:** indexes-performance.js
```sql
-- Single column (frequent WHERE)
CREATE INDEX idx_users_email ON users(email)

-- Composite (multiple WHERE conditions)
CREATE INDEX idx_posts_user_date ON posts(user_id, created_at DESC)

-- Partial (conditional filtering)
CREATE INDEX idx_recent_posts ON posts(user_id) 
WHERE created_at > now - interval '30 days'

-- Expression (on functions)
CREATE INDEX idx_lower_email ON users(LOWER(email))
```

#### Pattern: Query Analysis
**File:** indexes-performance.js
```sql
-- View execution plan
EXPLAIN SELECT ... FROM ...

-- View with actual statistics
EXPLAIN ANALYZE SELECT ... FROM ...

-- JSON format
EXPLAIN (FORMAT JSON, ANALYZE) SELECT ... FROM ...
```

---

### 🎭 **CONDITIONAL LOGIC**

#### Pattern: CASE in SELECT
**File:** case-union-operations.js → `getUserPostsWithCategory()`
```sql
SELECT 
  username,
  title,
  CASE 
    WHEN comment_count >= 50 THEN 'Viral'
    WHEN comment_count >= 20 THEN 'Popular'
    WHEN comment_count >= 5 THEN 'Trending'
    ELSE 'New'
  END as category
FROM posts
```

#### Pattern: Nested CASE
**File:** case-union-operations.js → `getUserActivityScore()`
```sql
SELECT 
  username,
  CASE 
    WHEN posts = 0 AND comments = 0 THEN 'No Activity'
    WHEN posts > 0 THEN
      CASE WHEN posts > 20 THEN 'High Posts'
           ELSE 'Low Posts' END
    ELSE 'Comments Only'
  END as activity_type
FROM user_stats
```

#### Pattern: Conditional Aggregation
```sql
SELECT 
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
  COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_count,
  SUM(CASE WHEN type = 'premium' THEN amount ELSE 0 END) as premium_revenue
FROM data
```

---

### 🔐 **DATA MODIFICATION**

#### Pattern: UPSERT (INSERT ON CONFLICT)
**File:** upsert-json-operations.js → `upsertUser()`
```sql
INSERT INTO users (username, email) VALUES ($1, $2)
ON CONFLICT (username) 
DO UPDATE SET email = EXCLUDED.email
RETURNING *
```

#### Pattern: Batch UPSERT
**File:** upsert-json-operations.js → `batchUpsertUsers()`
```sql
INSERT INTO users (username, email) VALUES 
  ($1, $2), ($3, $4), ($5, $6)
ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email
RETURNING *
```

---

### 📦 **JSON OPERATIONS**

#### Pattern: Query JSON
**File:** upsert-json-operations.js → `getUserMetadataFields()`
```sql
SELECT 
  username,
  metadata->>'name' as name,
  (metadata->'age')::INT as age,
  metadata->'preferences'->>'theme' as theme
FROM users
WHERE metadata IS NOT NULL
```

#### Pattern: Update JSON
**File:** upsert-json-operations.js → `updateUserPreferences()`
```sql
UPDATE users
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::JSONB),
  '{preferences}',
  $1::JSONB
)
WHERE id = $2
```

#### Pattern: JSON Array to Rows
**File:** upsert-json-operations.js → `expandUserSkills()`
```sql
SELECT 
  username,
  jsonb_array_elements(metadata->'skills') as skill
FROM users
WHERE metadata->'skills' IS NOT NULL
```

---

### 🔑 **COHORT ANALYSIS**

#### Pattern: User Retention by Signup Month
**File:** interview-practice-queries.js → `getUserSignupCohortRetention()`
```sql
WITH cohorts AS (
  SELECT 
    DATE_TRUNC('month', u.created_at)::DATE as signup_month,
    u.id,
    COUNT(p.id) as posts
  FROM users u
  LEFT JOIN posts p ON u.id = p.user_id
  GROUP BY u.id, signup_month
)
SELECT 
  signup_month,
  COUNT(*) as cohort_size,
  COUNT(CASE WHEN posts > 0 THEN 1 END) as active_users,
  ROUND(COUNT(CASE WHEN posts > 0 THEN 1 END)::NUMERIC / COUNT(*) * 100, 2) as retention_rate
FROM cohorts
GROUP BY signup_month
```

---

### 🌳 **RECURSIVE/HIERARCHICAL**

#### Pattern: Comment Thread (Tree Structure)
**File:** interview-practice-queries.js → `getCommentThread()`
```sql
WITH RECURSIVE thread AS (
  SELECT id, parent_id, content, 0 as depth, CAST(id AS TEXT) as path
  FROM comments WHERE parent_id IS NULL
  
  UNION ALL
  
  SELECT c.id, c.parent_id, c.content, t.depth + 1, t.path || '->' || c.id
  FROM comments c
  JOIN thread t ON c.parent_id = t.id
  WHERE t.depth < 10
)
SELECT REPEAT('  ', depth) || content as formatted FROM thread ORDER BY path
```

---

## 🎓 Interview Master Formulas

### Formula: Top N Per Group
```sql
WITH ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY group ORDER BY metric DESC) as rn
  FROM table
)
SELECT * FROM ranked WHERE rn <= N
```

### Formula: Running Total
```sql
SELECT *, SUM(amount) OVER (PARTITION BY group ORDER BY date) as running_total
FROM table
```

### Formula: Period-over-Period Growth
```sql
SELECT 
  period,
  value,
  LAG(value) OVER (ORDER BY period) as prev_value,
  value - LAG(value) OVER (ORDER BY period) as growth
FROM data
```

### Formula: Find Duplicates
```sql
SELECT key, COUNT(*) FROM table GROUP BY key HAVING COUNT(*) > 1
```

### Formula: Percentile Ranking
```sql
SELECT *, PERCENT_RANK() OVER (ORDER BY metric) as percentile FROM data
```

---

## 💾 Quick Syntax Reference

| Operation | Syntax |
|-----------|--------|
| **Select with limit** | `SELECT * FROM table LIMIT 10 OFFSET 5` |
| **Aggregate with group** | `SELECT group, COUNT(*), AVG(value) FROM table GROUP BY group` |
| **Filter groups** | `... GROUP BY group HAVING COUNT(*) > 5` |
| **Multiple joins** | `FROM t1 JOIN t2 ON ... JOIN t3 ON ... LEFT JOIN t4 ON ...` |
| **Self join** | `FROM t1 JOIN t1 AS t2 ON t1.id = t2.parent_id` |
| **CTE** | `WITH cte AS (SELECT ...) SELECT * FROM cte` |
| **Window function** | `SELECT *, ROW_NUMBER() OVER (PARTITION BY x ORDER BY y) FROM table` |
| **Recursive CTE** | `WITH RECURSIVE cte AS (base UNION ALL recursive) SELECT ...` |
| **Case statement** | `CASE WHEN condition THEN value ELSE default END` |
| **Subquery in FROM** | `FROM (SELECT ... ) AS subq` |
| **Update with join** | `UPDATE t1 SET col = t2.col FROM t2 WHERE t1.id = t2.id` |
| **Upsert** | `INSERT ... ON CONFLICT (key) DO UPDATE SET ...` |
| **Transaction** | `BEGIN; ... COMMIT; / ROLLBACK;` |
| **Explain analyze** | `EXPLAIN ANALYZE SELECT ...` |

---

## 🎯 The 5 Essential Patterns Everyone Must Know

1. **Top N Per Group** - One of the most common interview questions
2. **Window Functions** - Essential for analytics and ranking
3. **CTE (Common Table Expressions)** - Makes complex queries readable
4. **Multi-table JOINs** - The foundation of relational databases
5. **Aggregation with Conditions** - Real-world data analysis

---

These patterns cover ~95% of real-world PostgreSQL queries you'll encounter!
