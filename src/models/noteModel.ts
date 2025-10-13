import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.models.Note || mongoose.model("Note", noteSchema);
