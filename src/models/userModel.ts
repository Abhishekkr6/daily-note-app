import { Schema, model, models, Document } from "mongoose";

/**
 * User document interface for TypeScript and JSDoc
 * @typedef {Object} IUser
 * @property {string} email
 * @property {string} password
 * @property {string} username
 * @property {string} [avatarUrl]
 * @property {number} [loginAttempts]
 * @property {Date} [lockedUntil]
 * @property {Object} [preferences]
 * @property {string} [preferences.theme]
 * @property {string} [preferences.timezone]
 * @property {string} [resetPasswordToken]
 * @property {Date} [resetPasswordExpires]
 * @property {Date} [deletedAt]
 */
export interface IUser extends Document {
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  role?: string;
  email: string;
  password: string;
  username: string;
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
  notifications?: {
    taskReminders?: boolean;
    dailyDigest?: boolean;
    weeklyReport?: boolean;
    streakAlerts?: boolean;
    focusBreaks?: boolean;
    [key: string]: any;
  };
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  deletedAt?: Date;
  refreshToken?: string;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  currentStreak?: number;
  longestStreak?: number;
  lastStreakDate?: string;
  totalFocusSessions?: number;
  minutesFocused?: number;
  lastFocusSessionAt?: Date;
}

const UserSchema = new Schema<IUser>({
  notifications: {
    type: Object,
    default: {
      taskReminders: true,
      dailyDigest: true,
      weeklyReport: false,
      streakAlerts: true,
      focusBreaks: true,
    },
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
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please use a valid Email address"]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
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
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
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

const User = models.User || model<IUser>("User", UserSchema);

export default User;
