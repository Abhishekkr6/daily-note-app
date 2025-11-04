import mongoose, { Schema, Document } from "mongoose";

export interface ILeaderboardEntry extends Document {
  userId: string;
  period: string;
  score: number;
  streak?: number;
  lastUpdated?: Date;
  optOutSnapshot?: boolean;
  displayNameSnapshot?: string;
  avatarSnapshot?: string;
}

const LeaderboardSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    period: { type: String, required: true },
    score: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastUpdated: { type: Date },
    optOutSnapshot: { type: Boolean, default: false },
    displayNameSnapshot: { type: String },
    avatarSnapshot: { type: String }
  },
  { timestamps: true }
);

LeaderboardSchema.index({ period: 1, score: -1 });
LeaderboardSchema.index({ userId: 1 });

export default mongoose.models.LeaderboardEntry || mongoose.model<ILeaderboardEntry>("LeaderboardEntry", LeaderboardSchema);
