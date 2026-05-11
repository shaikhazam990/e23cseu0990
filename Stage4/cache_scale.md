# Stage 4

# Notification System Performance and Scaling Strategy

## Problem Overview

The notifications API is currently being called every time a student refreshes or opens the application. As the number of users grows, repeated database reads start increasing load on the system and response times become slower.

With thousands of students checking notifications simultaneously during placement drives or result announcements, the database can quickly become a bottleneck.

---

# Suggested Improvements

## 1. Redis Caching

A caching layer can reduce the number of direct database reads.

### What should be cached

- unread notification count
- recently fetched notifications
- frequently accessed priority notifications

### Example Flow

```txt
Client Request
   ↓
Redis Cache
   ↓ (cache miss)
Database