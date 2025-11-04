# Leaderboard — API Specification

This document specifies the API endpoints for the leaderboard feature and the expected request/response shapes. Privacy and authentication considerations are included.

## Endpoints

### 1) GET /api/leaderboard

- Description: Returns a paginated list of top users for a given period (period-specific or global).

- Query Parameters:
  - `period` (optional): `weekly` (default) / `global`
  - `limit` (optional): number, default 50, max 200
  - `cursor` (optional): pagination cursor
  - `filter` (optional): `friends` / `team` (if the feature exists)

- Authentication: Public-readable or authenticated depending on product decision. By default allow public read but exclude users who opted out.

- Response (200):

```json
{
  "data": [
    {
      "rank": 1,
      "userId": "6421f...",
      "displayName": "Abhishek",
      "avatarUrl": "https://...",
      "score": 1240,
      "delta": -1
    }
  ],
  "cursor": "..."
}
```

### 2) GET /api/leaderboard/me

- Description: Authenticated endpoint that returns the requesting user's rank and nearby users for context.

- Query Parameters:
  - `period` (optional): `weekly`/`global`

- Authentication: Required

- Response (200):

```json
{
  "me": {
    "rank": 42,
    "score": 320
  },
  "neighbors": []
}
```

### 3) POST /api/leaderboard/refresh

- Description: Internal/admin endpoint to trigger recompute or cache invalidation.

- Authentication: Admin-only or internal service token

- Body: optional `{ "period": "weekly" }`

- Response: 202 Accepted (job queued) or 200 OK if synchronous.

## Pagination

- Cursor-based pagination is recommended. The cursor can encode `{ lastScore, lastUserId }`.
- Avoid offset pagination for scale.

## Caching

- Cache top-N results in Redis with a TTL (recommended 30–120s).
- Cache key pattern: `leaderboard:{period}:top:{limit}`
- On scoring events, either invalidate affected caches or allow TTL expiration (invalidating gives stronger immediacy).

## Privacy & Security

- Do not return private fields (email, phone, tokens).
- Exclude users who have set `optOut`.
- Rate-limit endpoints to prevent scraping.

## Error codes

- 400 — Bad Request (invalid parameters)
- 401 — Unauthorized (for `/me` or admin endpoints)
- 403 — Forbidden (admin-only)
- 500 — Internal Server Error

## Examples

- Fetch top 50 weekly:

  - `GET /api/leaderboard?period=weekly&limit=50`

- Fetch my rank in global:

  - `GET /api/leaderboard/me?period=global`

---
*End of API spec.*
