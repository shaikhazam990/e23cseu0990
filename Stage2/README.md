# Stage 2 — Database Scaling Design

This stage covers database selection, schema design, and scaling strategies for the campus notification system.

## What's Included

- `database_scaling_design.md` — Full database design documentation including:
  - MongoDB vs PostgreSQL comparison with reasoning
  - Notification document schema
  - Identified scaling challenges (unread count, history size, peak traffic)
  - Solutions: indexing, pagination, Redis caching, archiving
  - Suggested indexes with examples
  - Performance considerations and tradeoffs

## Key Design Decisions

- **MongoDB chosen** over PostgreSQL for schema flexibility, native TTL indexes, and horizontal sharding support
- **Compound indexes** designed around actual query patterns, not guesswork
- **Redis cache** for the unread count — prevents DB hammering during placement/result announcements
- **Partial index** on unread documents keeps the hot-path index lean
- **Cursor-based pagination** recommended for deep history queries

## How to Navigate

Open `database_scaling_design.md`. Sections are ordered from design → problem → solution → tradeoff.
