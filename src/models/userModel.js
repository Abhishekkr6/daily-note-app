import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
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
    
    // Security & account status
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },

    // Extra metadata
    preferences: {
      theme: { type: String, default: "light" },
      timezone: { type: String, default: "UTC" },
    },

    // Password reset
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    // Soft delete (optional)
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Avoid model overwrite error in Next.js hot reload
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
