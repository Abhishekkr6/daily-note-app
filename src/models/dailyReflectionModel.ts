import mongoose, { Schema, Document } from "mongoose";

export interface IDailyReflection extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  wins: string[];
  pending: string[];
  suggestion: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailyReflectionSchema = new Schema<IDailyReflection>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true, index: true }, // Index for fast lookup
    wins: { type: [String], default: [] },
    pending: { type: [String], default: [] },
    suggestion: { type: String, default: "" },
  },
  { timestamps: true }
);

// Compound index to ensure one reflection per user per day
DailyReflectionSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.DailyReflection ||
  mongoose.model<IDailyReflection>("DailyReflection", DailyReflectionSchema);
