# Leaderboard — Data Model & Migration Plan

This document describes the database schema, indexes, and migration steps for the leaderboard. The goal is fast leaderboard reads and reliable auditability through score events.

## Models

### 1) LeaderboardEntry (aggregated)

- Description: Aggregated entry for each user, either period-specific or `global`.

- Fields (recommended):
  - `userId` : string / ObjectId (reference to the users collection)
  - `score` : number (aggregate score for the period)
  - `period` : string (e.g., `global` or `2025-W44` for weekly)
  - `streak` : number (optional)
  - `lastUpdated` : timestamp
  - `optOutSnapshot` : boolean (optional cached copy of the user's opt-out setting)
  - `displayNameSnapshot` : string (optional; helps if user changes name)
  - `avatarSnapshot` : string (optional)
  - `createdAt` : timestamp
  - `updatedAt` : timestamp

- Indexes:
  - Composite index: `(period, score DESC)` — for fast top-N queries per period
  - Index on `userId` — for fast lookup of a user's rank

### 2) ScoreEvent (audit log)

- Description: A granular log of every scoring action.

- Fields (recommended):
  - `userId` : string / ObjectId
  - `actionType` : string (e.g., `task_complete`)
  - `points` : number
  - `sourceId` : string (taskId / sessionId / templateId)
  - `meta` : object (optional additional info)
  - `createdAt` : timestamp

- Indexes:
  - Index on `userId` and `createdAt` (for backfills and user history lookups)

## Migration plan (step-by-step)

1. Create new collections/tables: `leaderboard_entries`, `score_events` (no data initially).
2. Add the indexes specified above.
3. Implement code paths that write to `ScoreEvent` and update `LeaderboardEntry` on relevant user actions (keep these changes behind a feature flag).
4. Backfill (optional):
   - If historical leaderboard data is desired, run a batch job that reads past tasks/focus sessions, emits `ScoreEvent`s, and aggregates them into `LeaderboardEntry`.
   - Backfill should be incremental (for example, last 6 months) to avoid heavy DB load.
5. Verification:
   - Run sample queries: select top-N from `leaderboard_entries` and compare results with computed aggregates from `score_events` for a subset of users.
6. Cleanup & Rollback:
   - Rollback plan: if migration causes issues, disable the feature flag and remove or ignore the new collections created during backfill. Always ensure DB backups are available before running migrations.

## Storage & scaling notes

- For a large user base, consider:
  - Using Redis sorted sets (ZADD) for near real-time ranking, with periodic persistence to the database.
  - Partitioning leaderboards by period to speed queries.
- Avoid TTLs on leaderboard collections—leaderboard data should be persistent. Use TTL only for ephemeral debug collections.

## Example document (LeaderboardEntry)

```json
{
  "userId": "6421f...",
  "score": 1240,
  "period": "2025-W44",
  "streak": 3,
  "lastUpdated": "2025-11-04T10:22:00Z",
  "optOutSnapshot": false,
  "displayNameSnapshot": "Abhishek",
  "avatarSnapshot": "https://.../avatar.png"
}
```

---
*End of model and migration plan.*
