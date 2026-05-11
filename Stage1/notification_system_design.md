# Notification System Design
## Campus Notification System — Stage 1

---

## 1. REST API Design

The API follows standard RESTful conventions. All endpoints return JSON. Authentication is assumed via JWT token passed in the `Authorization` header.

### Base URL

```
https://api.campusnotify.edu/api/v1
```

---

## 2. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Fetch paginated list of notifications |
| GET | `/api/notifications/:id` | Fetch a single notification by ID |
| PATCH | `/api/notifications/:id/read` | Mark a notification as read |
| GET | `/api/notifications/unread/count` | Get count of unread notifications |

---

## 3. Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | integer | Page number (1-indexed) | `1` |
| `limit` | integer | Number of results per page | `20` |
| `notification_type` | string | Filter by type: `event`, `result`, `placement` | (all) |

**Example request with query params:**

```
GET /api/notifications?page=2&limit=10&notification_type=placement
```

---

## 4. HTTP Headers

### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <JWT_TOKEN>` |
| `Content-Type` | Yes | `application/json` |
| `Accept` | Optional | `application/json` |

### Response Headers

| Header | Description |
|--------|-------------|
| `X-Total-Count` | Total number of notifications matching the query |
| `X-Page` | Current page number |
| `X-Limit` | Items per page |
| `Cache-Control` | `no-store` for unread count; `max-age=60` for lists |

---

## 5. Notification Schema

```json
{
  "id": "string (UUID)",
  "title": "string",
  "message": "string",
  "type": "event | result | placement",
  "isRead": "boolean",
  "priority": "low | normal | high",
  "createdAt": "ISO 8601 datetime string"
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID string | Unique identifier for the notification |
| `title` | string | Short heading shown in notification list |
| `message` | string | Full notification body text |
| `type` | enum | Category: `event`, `result`, `placement` |
| `isRead` | boolean | Whether the student has read this notification |
| `priority` | enum | Determines sort/display order; default is `normal` |
| `createdAt` | datetime | UTC timestamp of when notification was created |

---

## 6. Request / Response Examples

### GET `/api/notifications`

**Request:**
```http
GET /api/notifications?page=1&limit=5&notification_type=result
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "page": 1,
  "limit": 5,
  "totalCount": 42,
  "data": [
    {
      "id": "a3f2c891-4b1d-4e3a-9f2e-c12345678901",
      "title": "Semester Results Published",
      "message": "Your 5th semester results have been uploaded to the portal.",
      "type": "result",
      "isRead": false,
      "priority": "high",
      "createdAt": "2024-11-20T09:30:00Z"
    },
    {
      "id": "b9d1e472-7a3c-4b5d-8e1f-d98765432109",
      "title": "Supplementary Exam Schedule",
      "message": "Supplementary exams for 3rd semester will begin on December 10th.",
      "type": "result",
      "isRead": true,
      "priority": "normal",
      "createdAt": "2024-11-18T14:00:00Z"
    }
  ]
}
```

---

### GET `/api/notifications/:id`

**Request:**
```http
GET /api/notifications/a3f2c891-4b1d-4e3a-9f2e-c12345678901
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "a3f2c891-4b1d-4e3a-9f2e-c12345678901",
    "title": "Semester Results Published",
    "message": "Your 5th semester results have been uploaded to the portal. Login to check your grades and download the marksheet.",
    "type": "result",
    "isRead": false,
    "priority": "high",
    "createdAt": "2024-11-20T09:30:00Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Notification not found"
}
```

---

### PATCH `/api/notifications/:id/read`

**Request:**
```http
PATCH /api/notifications/a3f2c891-4b1d-4e3a-9f2e-c12345678901/read
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "a3f2c891-4b1d-4e3a-9f2e-c12345678901",
    "isRead": true
  }
}
```

---

### GET `/api/notifications/unread/count`

**Request:**
```http
GET /api/notifications/unread/count
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "unreadCount": 7
}
```

---

## 7. Pagination Strategy

Offset-based pagination is used here because the dataset is student-specific and queries are bounded per user. This is simpler to implement and works well when a student's total notification count stays in the hundreds.

**How it works:**

```
SKIP = (page - 1) * limit
FETCH = limit documents
```

So for `page=3&limit=10`, we skip 20 and return the next 10 records.

**Response includes:**
- `page` — current page
- `limit` — items per page
- `totalCount` — total matching documents (used by frontend to calculate total pages)

**Tradeoff:** For very large datasets, cursor-based pagination is better. But for this use case (bounded per student), offset pagination is sufficient and easier to implement.

---

## 8. Filtering Strategy

Filtering is done on the server using query parameters. The `notification_type` parameter maps directly to the `type` field in the database.

**Filtering logic (pseudo-code):**

```
query = { studentId: <logged-in user ID> }

if notification_type is provided:
    query.type = notification_type

results = DB.find(query).sort(createdAt: DESC).skip(offset).limit(limit)
```

Multiple filters can be combined:
```
GET /api/notifications?notification_type=placement&page=1&limit=10
```

No full-text search is needed in this version. All filters are equality-based, making indexing straightforward.

---

## 9. Realtime Notification Mechanism

### Option 1: Server-Sent Events (SSE)

SSE is a one-way channel from server to client over HTTP. The client opens a long-lived connection and the server pushes events when new notifications arrive.

```
GET /api/notifications/stream
Accept: text/event-stream
```

Server sends:
```
event: notification
data: {"id":"abc123","title":"Placement Drive Today","type":"placement"}

```

SSE is simple to implement and works over standard HTTP. Good for read-only push.

---

### Option 2: WebSockets *(Recommended)*

WebSockets establish a persistent, full-duplex TCP connection. Both client and server can send data at any time after the initial handshake.

```
ws://api.campusnotify.edu/ws?token=<JWT>
```

**Sample message from server:**
```json
{
  "event": "new_notification",
  "data": {
    "id": "c7d2e891-1a2b-4c3d-9e4f-123456789abc",
    "title": "Infosys Drive — Register Now",
    "type": "placement",
    "priority": "high",
    "createdAt": "2024-11-22T10:00:00Z"
  }
}
```

### Why WebSockets Over SSE for This System

| Factor | SSE | WebSocket |
|--------|-----|-----------|
| Direction | Server → Client only | Full duplex (both ways) |
| Protocol | HTTP/1.1 | TCP (upgraded from HTTP) |
| Browser Support | Good | Excellent |
| Read receipts | Not possible | Supported |
| Reconnect handling | Built-in | Manual |
| Scalability | Easier | Needs socket management |

**WebSockets are preferred here because:**
1. The client needs to send read receipts back (`markAsRead` over the same channel).
2. Priority notifications like placement drives need immediate delivery confirmation.
3. WebSockets allow broadcasting to multiple students at once (e.g., placement announcement to the entire batch).
4. Better suited for future features like live announcement chat or Q&A during events.

For a simple dashboard with read-only updates, SSE would work fine. But since we need bidirectional interaction, WebSockets is the right choice.

---

## 10. Error Handling

All errors return a consistent structure:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

| HTTP Status | When Used |
|-------------|-----------|
| `200 OK` | Successful request |
| `400 Bad Request` | Invalid query params or body |
| `401 Unauthorized` | Missing or invalid JWT |
| `404 Not Found` | Notification ID doesn't exist |
| `500 Internal Server Error` | Unexpected server failure |
