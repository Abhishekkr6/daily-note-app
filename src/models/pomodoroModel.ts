import mongoose from "mongoose";

const pomodoroSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: String, required: true }, // YYYY-MM-DD
  cycles: { type: Number, default: 0 },
  duration: { type: Number, default: 25 }, // minutes
}, { timestamps: true });

export default mongoose.models.Pomodoro || mongoose.model("Pomodoro", pomodoroSchema);
