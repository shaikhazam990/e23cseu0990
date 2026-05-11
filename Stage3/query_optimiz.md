# Query Optimization
## Campus Notification System — Stage 3

---

## 1. The Original Query

```sql
SELECT * FROM notifications
WHERE studentID = 1042
  AND isRead = false
ORDER BY createdAt ASC;
```

This query looks simple and works fine when the table has a few thousand rows. But in a system serving thousands of students — each with hundreds of notifications — this becomes a serious performance problem at scale.

---

## 2. Why This Query Becomes Slow at Scale

### Problem 1: Full Table Scan

Without an index on `studentID` and `isRead`, the database engine has no choice but to read every row in the `notifications` table, check if `studentID = 1042` and `isRead = false`, and collect the matches.

If the table has 5 million rows (500 notifications × 10,000 students), the engine is doing 5 million comparisons to return maybe 20 rows. This is an O(n) scan where n is the total table size, not the result size.

### Problem 2: `SELECT *` Fetches Everything

`SELECT *` tells the database to read every column for every matching row. This includes large text columns like `message` (which might be 1,000+ characters). If only the notification list view needs `title`, `type`, `isRead`, and `createdAt`, then `message` is being fetched and transferred over the wire for no reason. More data = more I/O = slower response.

### Problem 3: Sorting Overhead

`ORDER BY createdAt ASC` requires the database to take all matching rows and sort them in memory before returning results. If there are thousands of unread notifications for one student (unlikely but possible), this sort happens in a temporary buffer. Without an index that pre-orders the data, this is an additional pass over the result set.

### Problem 4: No Result Limiting

The query fetches all matching rows with no `LIMIT`. If a student has 200 unread notifications, all 200 are returned and processed — even if the frontend only shows 20 at a time. This wastes memory, CPU, and network bandwidth.

---

## 3. Optimized Query

```sql
SELECT id, title, type, isRead, createdAt
FROM notifications
WHERE studentID = 1042
  AND isRead = false
ORDER BY createdAt ASC
LIMIT 20
OFFSET 0;
```

**Changes made:**

| Change | Reason |
|--------|--------|
| `SELECT id, title, type, isRead, createdAt` | Only fetch columns the UI actually needs |
| Added `LIMIT 20` | Return one page of results, not everything |
| Added `OFFSET 0` | Support pagination without re-architecting later |
| Kept `WHERE` clause | Now backed by a compound index (see Section 4) |

---

## 4. Composite Indexing Strategy

A composite (compound) index on the right columns in the right order makes this query go from a full table scan to a direct index lookup.

### Recommended Index

```sql
CREATE INDEX idx_notifications_student_unread_date
ON notifications (studentID, isRead, createdAt ASC);
```

### Why This Column Order?

The order of columns in a composite index matters. The database uses indexes left-to-right.

1. **`studentID` first** — the highest cardinality filter. Every query hits a specific student. Putting this first narrows the dataset immediately.

2. **`isRead` second** — the second equality filter. After filtering by student, this further cuts the dataset to only unread rows.

3. **`createdAt` last** — used for sorting. Since it's already in the index and appears after the equality filters, the database can read index entries in sorted order without an additional sort pass.

**Result:** The database goes directly to the relevant portion of the index, reads only matching entries in order, and returns them. No full scan, no in-memory sort.

### How the Index Helps (Execution Plan Comparison)

Without index:
```
Seq Scan on notifications
  Filter: (studentID = 1042 AND isRead = false)
  Rows removed by filter: 4,999,983
  Sort: createdAt ASC
```

With index:
```
Index Scan using idx_notifications_student_unread_date
  Index Cond: (studentID = 1042 AND isRead = false)
  Rows: 17
```

The difference is scanning 5 million rows vs reading 17 index entries directly.

---

## 5. Why Indexing Every Column Is a Bad Idea

A common instinct is to "just index everything" to speed up queries. This backfires in practice.

**Indexes are not free:**

- Every `INSERT` or `UPDATE` on the `notifications` table must also update every index on that table. More indexes = more write overhead.
- Indexes consume storage. A large table with 10 indexes may use more disk space in indexes than in actual data.
- The query planner has to choose between available indexes. Too many can confuse the planner or cause it to pick a suboptimal one.
- RAM is used to cache hot index pages. If index data exceeds available RAM, performance degrades.

**Rule of thumb:** Index based on actual query patterns, not on "this column might be useful." Run `EXPLAIN ANALYZE` on your slow queries, see what the planner is doing, and add targeted indexes.

---

## 6. Computational Improvements

### 6.1 Replace `SELECT *` with Projection

```sql
-- Bad
SELECT * FROM notifications WHERE studentID = 1042;

-- Good
SELECT id, title, type, isRead, createdAt
FROM notifications WHERE studentID = 1042;
```

This reduces per-row data size significantly, especially when `message` is a long text field.

### 6.2 Use a Covering Index (Optional Advanced)

A covering index includes all the columns the query needs, so the database never has to touch the actual table rows:

```sql
CREATE INDEX idx_covering_notifications
ON notifications (studentID, isRead, createdAt, id, title, type);
```

With this, the query can be answered entirely from the index without touching the table at all. For high-read systems, this can make a significant difference.

### 6.3 Pre-compute Unread Count

Don't run `COUNT(*)` for the unread badge every time:

```sql
-- Expensive if called on every page load for every student
SELECT COUNT(*) FROM notifications
WHERE studentID = 1042 AND isRead = false;
```

Instead, maintain an `unread_counts` table or cache this value in Redis and update it incrementally when notifications are created or read.

```sql
-- Lightweight separate table
CREATE TABLE unread_counts (
  studentID INT PRIMARY KEY,
  count INT DEFAULT 0
);

-- Increment on insert
UPDATE unread_counts SET count = count + 1 WHERE studentID = 1042;

-- Decrement on read
UPDATE unread_counts SET count = count - 1 WHERE studentID = 1042;
```

This turns an O(n) aggregate into a single key lookup.

---

## 7. Pagination Optimization

### Offset Pagination (Current)

```sql
SELECT id, title, type, isRead, createdAt
FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC
LIMIT 20 OFFSET 40;  -- Page 3
```

This works well for early pages. But `OFFSET 40` means the database must still read and discard 40 rows before returning results. At `OFFSET 10000`, it's reading and discarding 10,000 rows — slow.

### Cursor-Based Pagination (Better for Deep Pages)

```sql
-- First page: no cursor
SELECT id, title, type, isRead, createdAt
FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC
LIMIT 20;

-- Next page: use createdAt of last returned row as cursor
SELECT id, title, type, isRead, createdAt
FROM notifications
WHERE studentID = 1042
  AND isRead = false
  AND createdAt > '2024-11-20T09:30:00Z'   -- cursor from last record
ORDER BY createdAt ASC
LIMIT 20;
```

The `createdAt > cursor` filter, backed by the composite index, goes directly to the right position. No rows are scanned and discarded. This is O(1) relative to page depth.

**Tradeoff:** The client must track the cursor from the last response. You can't jump to "page 50" directly. This is acceptable for notification lists where users scroll sequentially.

---

## 8. Summary: Optimization Checklist

| Issue | Fix |
|-------|-----|
| Full table scan | Composite index on `(studentID, isRead, createdAt)` |
| `SELECT *` | Project only needed columns |
| No LIMIT | Always paginate — `LIMIT 20 OFFSET n` |
| Sort overhead | Index already orders by `createdAt`, no extra sort |
| COUNT on every load | Cache unread count in Redis or a counter table |
| Deep offset pagination | Cursor-based pagination using last `createdAt` |
| Over-indexing | Only index columns used in actual WHERE/ORDER clauses |

Run `EXPLAIN ANALYZE` before and after any index change to verify the planner is actually using the new index. Index creation doesn't guarantee the query planner will use it — query structure, statistics, and table size all affect the decision.
