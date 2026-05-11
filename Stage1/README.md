# Stage 1 — Notification System Design

This stage covers the REST API design for the campus notification system.

## What's Included

- `notification_system_design.md` — Full API documentation including:
  - REST endpoints with request/response examples
  - Notification schema and field descriptions
  - HTTP headers (request and response)
  - Pagination and filtering strategy
  - Realtime mechanism comparison (SSE vs WebSockets)

## Key Design Decisions

- **Offset-based pagination** — simple and sufficient for per-student notification lists
- **WebSockets over SSE** — enables bidirectional communication for read receipts and live broadcasts
- **Query-param filtering** — keeps the API clean and easy to extend
- **Consistent error format** — all errors return `{ success, error, code }` shape

## How to Navigate

Start with `notification_system_design.md`. Each section is self-contained and interview-ready.
