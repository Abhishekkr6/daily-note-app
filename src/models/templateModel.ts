import mongoose from "mongoose";

const TemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  type: { type: String, required: true },
  content: { type: String },
  tags: [{ type: String }],
  isStarred: { type: Boolean, default: false },
  usageCount: { type: Number, default: 0 },
  userId: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Template || mongoose.model("Template", TemplateSchema);
