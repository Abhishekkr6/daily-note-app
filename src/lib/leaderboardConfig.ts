// leaderboardConfig.ts
// Configuration and small helpers for the Leaderboard scoring system.
// Keep this file as the single source of truth for scoring weights, caps and diminishing rules.

export type Period = 'weekly' | 'global';

export interface DiminishingThreshold {
  from: number; // inclusive
  to: number; // inclusive
  multiplier: number; // multiply basePoints by this
}

export interface ActionConfig {
  basePoints: number;
  capPerDay: number;
  sourceRequired: boolean;
  description?: string;
}

export interface LeaderboardConfig {
  periods: Period[];
  globalMaxPointsPerUserPerDay: number;
  diminishing: {
    thresholds: DiminishingThreshold[];
  };
  actions: Record<string, ActionConfig>;
}

export const leaderboardConfig: LeaderboardConfig = {
  periods: ['weekly', 'global'],
  globalMaxPointsPerUserPerDay: 500,
  diminishing: {
    thresholds: [
      { from: 1, to: 5, multiplier: 1.0 },
      { from: 6, to: 10, multiplier: 0.5 },
      { from: 11, to: 9999, multiplier: 0.25 }
    ]
  },
  actions: {
    task_complete: {
      basePoints: 10,
      capPerDay: 200,
      sourceRequired: true,
      description: 'Points for each unique task completion'
    },
    task_complete_early: {
      basePoints: 5,
      capPerDay: 50,
      sourceRequired: true,
      description: 'Bonus when task is completed before its due date (apply only if task_complete awarded)'
    },
    focus_session_complete: {
      basePoints: 5,
      capPerDay: 50,
      sourceRequired: true,
      description: 'Points for each completed focus session'
    },
    daily_streak_increment: {
      basePoints: 20,
      capPerDay: 60,
      sourceRequired: false,
      description: "Award when user's consecutive-day streak increases"
    },
    template_used: {
      basePoints: 2,
      capPerDay: 20,
      sourceRequired: true,
      description: 'Small bonus when a task is created from a template'
    },
    referral_bonus: {
      basePoints: 25,
      capPerDay: 25,
      sourceRequired: true,
      description: 'Optional referral bonus (if program enabled)'
    }
  }
};

/**
 * Get diminishing multiplier for a given ordinal count (1-based) of the same action on the same day.
 * Example: count=1 => multiplier per thresholds (typically 1.0)
 */
export function getDiminishingMultiplier(count: number): number {
  const t = leaderboardConfig.diminishing.thresholds.find(th => count >= th.from && count <= th.to);
  return t ? t.multiplier : 0;
}

export default leaderboardConfig;
