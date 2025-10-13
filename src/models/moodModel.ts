import mongoose, { Schema, Document } from "mongoose";

export interface IMood extends Document {
  userId: string;
  date: string; // YYYY-MM-DD
  mood: number; // -2 to +2
  note?: string;
}

const MoodSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  mood: { type: Number, required: true },
  note: { type: String },
}, { timestamps: true });

export default mongoose.models.Mood || mongoose.model<IMood>("Mood", MoodSchema);
