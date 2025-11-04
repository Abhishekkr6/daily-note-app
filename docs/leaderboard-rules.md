# Leaderboard — Scoring Rules

This document is the official scoring specification for the leaderboard feature. Keep it simple, approved by product, and easy for developers to follow.

## Overview

- Supported periods: `weekly`, `global` (initial rollout will focus on these two).
- Users are shown on the leaderboard by default (user setting: `Show me on leaderboard` = true).
- Scoring operates on two levels:
  1. `ScoreEvent` — a granular audit record for every scoring action.
  2. `LeaderboardEntry` — aggregated score per user per period for fast reads.

## Scoring table (action → basePoints → capPerDay → notes)

- `task_complete` → basePoints: 10 → capPerDay: 200 → "Points awarded for each unique task completion; the same task should not be scored multiple times."
- `task_complete_early` → basePoints: 5 → capPerDay: 50 → "Bonus if a task is completed before its due date."
- `focus_session_complete` → basePoints: 5 → capPerDay: 50 → "Awarded for each successfully completed focus session."
- `daily_streak_increment` → basePoints: 20 → capPerDay: 60 → "Awarded when the user's consecutive-day streak increases (cap to prevent abuse)."
- `template_used` → basePoints: 2 → capPerDay: 20 → "Small bonus when a task is created from a template."
- `referral_bonus` (optional) → basePoints: 25 → capPerDay: 25 → "Limited bonus if a referral system exists."

### Global caps and anti-spam

- `maxPointsPerUserPerDay` = 500 (maximum points a user can earn per calendar day).
- Rapid-repeat detection: if too many events originate from the same source in a short window, apply the configured diminishing-return rule.
- Duplicate protection: each `ScoreEvent` must include a `sourceId` (taskId, sessionId, etc.) so repeated scoring for the same source can be prevented.

### Tie-breaker

When two users have the same score:

1. The user with more `totalTasksCompleted` ranks higher.
2. If still tied, the user with earlier `lastUpdated` wins.

### Diminishing returns (policy)

- If an action is repeated more than N times in a single day, reduce the points awarded for subsequent repeats (example policy: repeats 1..5 = full points; 6..10 = 50% points; >10 = 25% points).
- This policy should be configurable in a central config so it can be tuned without code changes.

### Examples (happy path)

- Example: User A completes 10 tasks, finishes 2 focus sessions, and gets 1 streak increment: score = 10*10 + 2*5 + 20 = 140
- Cap check: if the user performs many small actions in one day, the per-day cap of 500 will apply.

## Logging and Audit

- Create a `ScoreEvent` for every scoring decision (required).
- `ScoreEvent` fields: `userId`, `actionType`, `points`, `sourceId`, `createdAt`, `meta` (reason/notes).
- Audit logs are required for abuse investigations and historical analysis.

## Review and Versioning

- Track changes to this file with a version tag.
- Add a short changelog entry for every modification (date, author, summary).

---
*End of scoring rules.*
