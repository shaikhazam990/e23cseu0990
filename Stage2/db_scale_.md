# Database Scaling Design
## Campus Notification System — Stage 2

---

## 1. Database Selection: MongoDB vs PostgreSQL

### Comparison

| Factor | MongoDB | PostgreSQL |
|--------|---------|------------|
| Data model | Document (JSON/BSON) | Relational (tables, rows) |
| Schema flexibility | Schema-less | Strict schema |
| Horizontal scaling | Built-in sharding | Manual partitioning |
| JSON support | Native | Good (JSONB) |
| Read performance | High (no joins needed) | High (with indexes) |
| Write performance | Very high | Moderate |
| Aggregation | MongoDB aggregation pipeline | SQL GROUP BY / window functions |
| Indexing | Compound, TTL, partial indexes | Same |

### Why MongoDB Fits This Project

Notifications are self-contained documents. Each one has a fixed set of fields — `title`, `message`, `type`, `isRead`, `createdAt` — and doesn't need to JOIN with other tables to be rendered in the UI.

**Specific reasons:**

1. **Document shape matches the API response directly.** No need to map relational rows to JSON objects; what we store is what we return.

2. **Schema flexibility.** Different notification types (event vs placement vs result) might carry slightly different metadata over time. In MongoDB we can add fields per document without migrating the entire collection.

3. **TTL indexes.** MongoDB supports TTL (time-to-live) indexes natively, which lets us automatically expire old notifications after 6–12 months without a cron job.

4. **Horizontal scaling via sharding.** When the student base grows to tens of thousands, MongoDB can shard the collection on `studentId`, distributing the load across nodes. PostgreSQL needs manual partitioning to achieve the same.

5. **High write throughput.** During placement season, thousands of notifications can fire simultaneously. MongoDB handles high write concurrency better without locking issues.

**When PostgreSQL would be better:**
If we needed complex cross-collection analytics (e.g., "which students read placement notifications within the first 10 minutes"), PostgreSQL's relational joins and window functions would be more ergonomic. For pure notification delivery and retrieval, MongoDB wins.

---

## 2. Notification Schema Design

```javascript
// MongoDB Collection: notifications

{
  _id: ObjectId("65b3f2c891a4b1d4e3a9f2e1"),   // auto-generated
  studentId: "STU-1042",                          // indexed
  title: "Infosys Placement Drive",
  message: "Infosys will be conducting a placement drive on Dec 5th. Register before Nov 30th via the placement portal.",
  type: "placement",                              // enum: event | result | placement
  isRead: false,                                  // indexed (partial)
  priority: "high",                               // low | normal | high
  createdAt: ISODate("2024-11-20T09:30:00Z"),    // indexed (TTL + sort)
  expiresAt: ISODate("2025-05-20T09:30:00Z")     // TTL index field
}
```

### Field Notes

| Field | Type | Purpose |
|-------|------|---------|
| `_id` | ObjectId | Auto-generated unique ID per document |
| `studentId` | string | Links notification to a student (not using ObjectId ref here for query speed) |
| `title` | string | Short label shown in notification list |
| `message` | string | Full text of the notification |
| `type` | string (enum) | Enables filtering by category |
| `isRead` | boolean | Drives the unread badge count |
| `priority` | string (enum) | Used for visual differentiation; `high` priority notifications may be pinned |
| `createdAt` | Date | Sort field; timestamp when notification was generated |
| `expiresAt` | Date | Used with TTL index to auto-delete old records |

---

## 3. Scaling Challenges

### Challenge 1: Growing Unread Notifications

As students accumulate hundreds of unread notifications, queries like `{ studentId, isRead: false }` can scan large portions of the collection without a proper index. This makes the unread badge count slow to compute.

### Challenge 2: Large Notification History

A 4-year student might accumulate 1,000+ notifications. Paginated reads of old notifications become expensive if the collection isn't indexed properly. Fetching page 50 of 1,000 records requires skipping 490 documents.

### Challenge 3: High Traffic During Placements and Results

When the placement cell sends a batch notification to 2,000+ students at once, the write load spikes sharply. Similarly, when semester results are published, every student immediately hits `/unread/count` and `/notifications` within minutes. This creates a thundering herd problem — thousands of concurrent reads hitting the database at the same time.

---

## 4. Solutions

### 4.1 Indexing

Proper indexing eliminates full collection scans. For this system, the primary access pattern is:

> "Give me all notifications for student X, unread only, sorted by date."

This maps to a compound index:

```javascript
db.notifications.createIndex(
  { studentId: 1, isRead: 1, createdAt: -1 },
  { name: "idx_student_unread_date" }
)
```

This single index covers the three most common queries:
- All notifications for a student (sorted by date)
- Unread notifications for a student
- Filtered by type + student

For type-based filtering, a separate index helps:

```javascript
db.notifications.createIndex(
  { studentId: 1, type: 1, createdAt: -1 },
  { name: "idx_student_type_date" }
)
```

### 4.2 Pagination

Never load all records into memory. Always paginate at the database level.

**Offset-based (current):**
```javascript
db.notifications
  .find({ studentId: "STU-1042" })
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
```

**Cursor-based (for large datasets):**
When page numbers get large (page 100+), `skip()` becomes expensive because MongoDB still scans skipped documents. Cursor-based pagination avoids this:

```javascript
// After fetching last record, use its _id as cursor
db.notifications
  .find({
    studentId: "STU-1042",
    _id: { $lt: ObjectId("last_seen_id") }
  })
  .sort({ createdAt: -1 })
  .limit(20)
```

This is O(1) regardless of how deep into history you are.

### 4.3 Caching

The unread count is fetched on every page load. Computing it from the database every time is wasteful, especially during peak traffic.

**Strategy: Cache the unread count in Redis**

```
Key:   unread:STU-1042
Value: 7
TTL:   60 seconds
```

When a new notification is delivered → increment the cache key.
When a student reads a notification → decrement the cache key.
If the key is missing → recompute from DB and re-cache.

This reduces DB reads for the unread badge from N per minute to 1 per 60 seconds per student.

For notification list responses, we can cache the first page (most common) per student with a 30-second TTL. This absorbs most of the thundering herd during result announcements.

### 4.4 Archiving Old Notifications

Keeping years of notifications in the active collection slows down every query. Old read notifications don't need to be in the hot collection.

**Two approaches:**

**Option A: TTL Index (automatic expiry)**
```javascript
db.notifications.createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
)
```
MongoDB automatically deletes documents once `expiresAt` is past. Set it to 6 months from `createdAt` for read notifications, longer for unread.

**Option B: Archive Collection**
A nightly job moves notifications older than 6 months that are already read into a separate `notifications_archive` collection. Students can still view history via an "Archive" section with a separate, slower query path. The active collection stays lean and fast.

Both approaches can be combined — TTL for auto-expiry of very old records, archive collection for medium-age history.

---

## 5. Suggested Indexes Summary

```javascript
// Primary access pattern: student + read status + date
db.notifications.createIndex(
  { studentId: 1, isRead: 1, createdAt: -1 }
)

// Type-filtered queries
db.notifications.createIndex(
  { studentId: 1, type: 1, createdAt: -1 }
)

// Auto-expiry of old notifications
db.notifications.createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
)

// Partial index: only index unread documents (saves space)
db.notifications.createIndex(
  { studentId: 1, createdAt: -1 },
  { partialFilterExpression: { isRead: false } }
)
```

The partial index is particularly useful — instead of indexing all notifications, it only indexes unread ones. Since unread counts are the most frequent query and the dataset is smaller, this index stays compact and fast.

---

## 6. Performance Considerations

- **Write amplification**: Every notification write also updates indexes. Keep the number of indexes to what's actually needed — don't over-index.
- **Hot studentId**: If one student has 10,000 notifications, all in one shard, that shard becomes a hotspot. Shard key should be `{ studentId: "hashed" }` to distribute evenly.
- **Connection pooling**: During peak load (placement announcements), spike in concurrent connections can exhaust the MongoDB connection pool. Keep pool size reasonable and use a queue on the write path.
- **Projection**: Always specify only the fields needed (`.project({ title: 1, type: 1, isRead: 1, createdAt: 1 })`). Avoid returning `message` in list views — fetch it only on the detail endpoint.

---

## 7. Tradeoffs

| Decision | Benefit | Tradeoff |
|----------|---------|----------|
| MongoDB over PostgreSQL | Flexible schema, TTL index, horizontal sharding | Weaker support for complex analytics queries |
| Compound indexes | Single index covers multiple query patterns | Increases write overhead and storage |
| Redis caching for unread count | Reduces DB load during peak traffic | Cache invalidation complexity |
| TTL expiry | Zero-maintenance cleanup of old data | No recovery if a notification is deleted too early |
| Cursor-based pagination | O(1) deep pagination | Frontend can't jump to arbitrary pages |
| Partial index on unread | Smaller index, faster unread queries | Doesn't help queries that mix read and unread |
