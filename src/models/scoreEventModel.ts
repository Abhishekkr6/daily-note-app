import mongoose, { Schema, Document } from "mongoose";

export interface IScoreEvent extends Document {
  userId: string;
  actionType: string;
  sourceId?: string;
  pointsRaw: number;
  pointsAwarded: number;
  reason?: string;
  meta?: any;
  createdAt: Date;
  processedAt?: Date;
}

const ScoreEventSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actionType: { type: String, required: true },
    sourceId: { type: String, required: false },
    pointsRaw: { type: Number, required: true },
    pointsAwarded: { type: Number, required: true },
    reason: { type: String },
    meta: { type: Object, default: {} },
    processedAt: { type: Date }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Unique idempotency index when sourceId exists
try {
  ScoreEventSchema.index({ userId: 1, actionType: 1, sourceId: 1 }, { unique: true, partialFilterExpression: { sourceId: { $exists: true } } });
} catch (e) {
  // Log index creation errors in non-production environments
  if (process.env.NODE_ENV !== "production") {
    console.warn("ScoreEventSchema index creation error:", e);
  } else {
    throw e;
  }
}

export default mongoose.models.ScoreEvent || mongoose.model<IScoreEvent>("ScoreEvent", ScoreEventSchema);
