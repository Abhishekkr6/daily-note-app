import leaderboardConfig, { getDiminishingMultiplier } from "@/lib/leaderboardConfig";
import ScoreEvent from "@/models/scoreEventModel";
import LeaderboardEntry from "@/models/leaderboardModel";
import User from "@/models/userModel";
import mongoose from "mongoose";

interface ScoreEventInput {
  userId: string;
  actionType: string;
  sourceId?: string;
  timestamp?: string;
  meta?: any;
}

interface AwardResult {
  finalAward: number;
  pointsRaw: number;
  reason: string;
  details?: any;
}

function getDayRange(ts?: string) {
  const d = ts ? new Date(ts) : new Date();
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
  return { start, end };
}

export function getWeekKey(ts?: string) {
  const d = ts ? new Date(ts) : new Date();
  // ISO week calculation
  const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

interface ComputeAwardParams {
  actionType: string;
  basePoints: number;
  actionTotalSoFar: number;
  userGlobalTotalSoFar: number;
  countForActionToday: number;
  capPerDay: number;
  globalMax: number;
}

export async function computeAward(params: ComputeAwardParams) {
  const { basePoints, actionTotalSoFar, userGlobalTotalSoFar, countForActionToday, capPerDay, globalMax } = params;
  const multiplier = getDiminishingMultiplier(countForActionToday);
  const pointsRaw = basePoints * multiplier;
  const allowedActionRemaining = Math.max(0, capPerDay - actionTotalSoFar);
  const afterActionCap = Math.min(pointsRaw, allowedActionRemaining);
  const allowedGlobalRemaining = Math.max(0, globalMax - userGlobalTotalSoFar);
  const finalAward = Math.min(afterActionCap, allowedGlobalRemaining);
  let reason = "normal";
  if (multiplier < 1) reason = "diminished";
  if (afterActionCap < pointsRaw) reason = "action_cap_truncated";
  if (finalAward < afterActionCap) reason = "global_cap_truncated";
  if (finalAward === 0 && pointsRaw === 0) reason = "no_points";
  return { pointsRaw, finalAward, reason };
}

export async function awardPoints(input: ScoreEventInput) {
  const now = new Date();

  // fetch user snapshot
  const user = await User.findById(input.userId).lean();
  // normalize user to any to avoid accidental array/document union types from mongoose typings
  const u = user as any;
  const showOnLeaderboard = u
    ? (u.showOnLeaderboard !== undefined
        ? u.showOnLeaderboard
        : (u.preferences && u.preferences.showOnLeaderboard !== undefined
            ? u.preferences.showOnLeaderboard
            : true))
    : true;

  const toObjectId = (id: string) => {
    try {
      return new mongoose.Types.ObjectId(id);
    } catch {
      return id;
    }
  };

  // Idempotency: if sourceId provided and existing ScoreEvent exists, return duplicate
  if (input.sourceId) {
    const existing = await ScoreEvent.findOne({ userId: toObjectId(input.userId), actionType: input.actionType, sourceId: input.sourceId });
    if (existing) {
      return { finalAward: 0, pointsRaw: existing.pointsRaw || 0, reason: "duplicate" };
    }
  }

  // Determine today's totals
  const { start, end } = getDayRange(now.toISOString());
  const actionTotalAgg = await ScoreEvent.aggregate([
    { $match: { userId: toObjectId(input.userId), actionType: input.actionType, createdAt: { $gte: start, $lte: end } } },
    { $group: { _id: null, total: { $sum: "$pointsAwarded" }, count: { $sum: 1 } } }
  ]);
  const actionTotalSoFar = (actionTotalAgg[0] && actionTotalAgg[0].total) || 0;
  const actionCountSoFar = (actionTotalAgg[0] && actionTotalAgg[0].count) || 0;

  const globalTotalAgg = await ScoreEvent.aggregate([
    { $match: { userId: toObjectId(input.userId), createdAt: { $gte: start, $lte: end } } },
    { $group: { _id: null, total: { $sum: "$pointsAwarded" } } }
  ]);
  const userGlobalTotalSoFar = (globalTotalAgg[0] && globalTotalAgg[0].total) || 0;

  const countForActionToday = actionCountSoFar + 1;

  // derive action configuration (safe defaults if config missing)
  const actionCfg = (leaderboardConfig.actions && (leaderboardConfig.actions as any)[input.actionType]) || {};
  const basePoints = actionCfg.points ?? actionCfg.basePoints ?? 0;
  const capPerDay = typeof actionCfg.capPerDay === "number" ? actionCfg.capPerDay : Number.MAX_SAFE_INTEGER;
  const globalMax = typeof actionCfg.globalMax === "number" ? actionCfg.globalMax : Number.MAX_SAFE_INTEGER;

  const { pointsRaw, finalAward, reason } = await computeAward({
    actionType: input.actionType,
    basePoints,
    actionTotalSoFar,
    userGlobalTotalSoFar,
    countForActionToday,
    capPerDay,
    globalMax
  });

  // Persist ScoreEvent
  await ScoreEvent.create({
    userId: input.userId,
    actionType: input.actionType,
    sourceId: input.sourceId,
    pointsRaw,
    pointsAwarded: finalAward,
    reason,
    meta: input.meta || {},
    processedAt: now
  });

  // Helper functions for display name and opt-out logic
  function getUserDisplayName(user: any): string | undefined {
    return user?.name ?? user?.username ?? user?.email;
  }

  function getUserOptOut(user: any): boolean {
    if (!user) return true;
    if (user.showOnLeaderboard !== undefined) return user.showOnLeaderboard;
    if (user.preferences && user.preferences.showOnLeaderboard !== undefined) return user.preferences.showOnLeaderboard;
    return true;
  }

  // Upsert leaderboard entries for weekly and global
  try {
    if (finalAward > 0) {
      const periods = [] as string[];
      if (leaderboardConfig.periods.includes("weekly" as any)) periods.push(getWeekKey(now.toISOString()));
      if (leaderboardConfig.periods.includes("global" as any)) periods.push("global");

      // Use helper functions for display name and opt-out status
      const displayNameSnapshot = getUserDisplayName(user);
      const optOutSnapshot = getUserOptOut(user);

      for (const p of periods) {
        await LeaderboardEntry.findOneAndUpdate(
          { userId: input.userId, period: p },
          { $inc: { score: finalAward }, $set: { lastUpdated: new Date(), optOutSnapshot, displayNameSnapshot } },
          { upsert: true, new: true }
        );
      }
    }
  } catch (e) {
    // log and continue
    console.error("Leaderboard upsert failed:", e);
  }

  // Return result
  return { finalAward, pointsRaw, reason, details: { actionTotalSoFar, userGlobalTotalSoFar } };
}

export default { awardPoints, computeAward };
