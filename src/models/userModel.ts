import { Schema, model, models, Document } from "mongoose";

/**
 * User document interface for TypeScript and JSDoc
 * @property {string} [avatarUrl]
 * @property {number} [loginAttempts]
 * @property {Date} [lockedUntil]
 * @property {Object} [preferences]
 * @property {string} [preferences.theme]
 * @property {string} [preferences.timezone]
 * @property {Date} [deletedAt]
 */
export interface IUser extends Document {
  // Identity fields
  email?: string;
  username?: string;
  name?: string;

  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  role?: string;
  avatarUrl?: string;
  loginAttempts?: number;
  lockedUntil?: Date;
  preferences?: {
    theme?: string;
    timezone?: string;
    leaderboardSeen?: boolean;
    workingHours?: {
      start?: string;
      end?: string;
    };
  };

  // resetPasswordToken deprecated and removed
  deletedAt?: Date;
  refreshToken?: string;
  currentStreak?: number;
  longestStreak?: number;
  lastStreakDate?: string;
  totalFocusSessions?: number;
  minutesFocused?: number;
  lastFocusSessionAt?: Date;
}

const UserSchema = new Schema<IUser>({
    // Basic identity fields
    email: {
      type: String,
      default: null,
      index: true,
    },
    username: {
      type: String,
      default: null,
      index: true,
    },
    name: {
      type: String,
      default: null,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    preferences: {
      theme: { type: String, default: "light" },
      timezone: { type: String, default: "UTC" },
      leaderboardSeen: { type: Boolean, default: false },
      workingHours: {
        type: Object,
        default: { start: "09:00", end: "17:00" }
      }
    },
    // resetPasswordToken and resetPasswordExpires removed — password reset flow is deprecated
    deletedAt: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    // Streak fields
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastStreakDate: {
      type: String,
      default: null,
    },
    totalFocusSessions: {
      type: Number,
      default: 0,
    },
    minutesFocused: {
      type: Number,
      default: 0,
    },
    lastFocusSessionAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Create a partial unique index so only real string emails are constrained.
// This avoids duplicate-key failures when documents have email: null/undefined.
UserSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } }
);

const User = models.User || model<IUser>("User", UserSchema);

export default User;
