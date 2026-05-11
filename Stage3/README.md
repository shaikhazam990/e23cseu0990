# Stage 3 — Query Optimization

This stage analyzes a slow SQL query, identifies the root causes, and provides optimized alternatives backed by indexing strategy.

## What's Included

- `query_optimization.md` — Full query analysis including:
  - Original slow query and its problems (full scan, `SELECT *`, no limit, sort overhead)
  - Optimized query with only required columns and pagination
  - Composite index design with column-order reasoning
  - Why over-indexing causes write performance degradation
  - Covering index as an advanced optimization
  - Pre-computed unread count strategy (counter table + Redis)
  - Cursor-based pagination for deep pages

## Key Findings

- `SELECT *` is a silent performance killer — always project only what the UI needs
- `ORDER BY` without an index causes in-memory sort on every query
- `OFFSET` pagination degrades linearly — cursor-based pagination is O(1)
- Composite index column order matters: `studentID → isRead → createdAt`
- Counter table / Redis cache eliminates expensive `COUNT(*)` for unread badge

## How to Navigate

Open `query_optimization.md`. It follows a problem → analysis → solution → tradeoff structure, readable both as documentation and as an interview walkthrough.
