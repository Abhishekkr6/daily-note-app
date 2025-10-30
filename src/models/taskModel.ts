import mongoose, { Schema, Document } from "mongoose";


export interface ITask extends Document {
  title: string;
  description?: string;
  dueDate?: string;
  tag?: string;
  priority?: "High" | "Medium" | "Low";
  status: "overdue" | "today" | "completed";
  userId?: string;
  notificationTime?: string;
  focusSessions?: [
    {
      startedAt: { type: Date, required: true },
      duration: { type: Number, required: true }, 
      completed: { type: Boolean, default: false },
      completedAt: { type: Date }
    }
  ];
}


const TaskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: String },
  tag: { type: String },
  priority: { type: String, enum: ["High", "Medium", "Low"] },
  status: { type: String, enum: ["overdue", "today", "completed"], default: "today" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  notificationTime: { type: String },
  focusSessions: {
    type: [
      {
        startedAt: { type: Date, required: true },
        duration: { type: Number, required: true }, 
        completed: { type: Boolean, default: false },
        completedAt: { type: Date }
      }
    ]
  }
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
