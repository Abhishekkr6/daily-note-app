import { connect } from "@/dbConfig/dbConfig";
import Task from "@/models/taskModel";
import Mood from "@/models/moodModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// GET: Return activity data for last 49 days
export async function GET(req) {
  await connect();
  let userId;
  try {
    userId = getDataFromToken(req);
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Get last 49 days
  const today = new Date();
  const days = Array.from({ length: 49 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    return d.toISOString().slice(0, 10);
  });
  // Fetch completed tasks per day.
  // Use updatedAt (task completion/update time) and group by its YYYY-MM-DD string so
  // tasks without a dueDate are still counted when they are marked completed.
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 48); // earliest date to include (inclusive)
  startDate.setHours(0, 0, 0, 0);

  const tasks = await Task.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), status: "completed", updatedAt: { $gte: startDate } } },
    // Project date string in YYYY-MM-DD format from updatedAt
    { $project: { dateStr: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } } } },
    { $group: { _id: "$dateStr", count: { $sum: 1 } } }
  ]);
  // Fetch moods per day
  const moods = await Mood.find({ userId, date: { $in: days } });
  // Merge data
  const activity = days.map(date => {
    const task = tasks.find(t => t._id === date);
    const mood = moods.find(m => m.date === date);
    return {
      date,
      completed: task ? task.count : 0,
      mood: mood ? mood.mood : null,
    };
  });
  return NextResponse.json(activity);
}
