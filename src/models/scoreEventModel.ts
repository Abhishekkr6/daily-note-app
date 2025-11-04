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
ScoreEventSchema.index(
  { userId: 1, actionType: 1, sourceId: 1 },
  { unique: true, partialFilterExpression: { sourceId: { $exists: true } } }
);

const ScoreEventModel = mongoose.models.ScoreEvent || mongoose.model<IScoreEvent>("ScoreEvent", ScoreEventSchema);

// Optional: handle index errors
ScoreEventModel.on("index", (err: any) => {
  if (err && process.env.NODE_ENV !== "production") {
    console.warn("ScoreEventModel index creation error:", err);
  }
});

export default ScoreEventModel;
