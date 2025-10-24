import { connect } from "@/dbConfig/dbConfig";
import Task from "@/models/taskModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

export async function GET(req) {
  await connect();
  let userId;
  try {
    userId = getDataFromToken(req);
  } catch (err) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  // Find all 'today' tasks with dueDate before today and mark them as 'overdue'
  await Task.updateMany(
    {
      userId,
      status: "today",
      dueDate: { $lt: todayStr }
    },
    { $set: { status: "overdue" } }
  );

  // Date-based search
  const { searchParams } = new URL(req.url, 'http://localhost');
  const date = searchParams.get('date');
  let query = { userId };
  if (date) {
    // Match tasks where dueDate starts with the selected date (YYYY-MM-DD)
    query.dueDate = { $regex: `^${date}` };
  }
  const tasks = await Task.find(query);
  return Response.json(tasks);
}

export async function POST(req) {
  await connect();
  let userId;
  try {
    userId = getDataFromToken(req);
  } catch (err) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (body._id) delete body._id;
  body.userId = userId;
  const newTask = await Task.create(body);

  // Streak logic
  const User = require("@/models/userModel").default;
  const todayStr = new Date().toISOString().slice(0, 10);
  const user = await User.findById(userId);
  if (user) {
    // If lastStreakDate is yesterday or today, increment streak
    const lastDate = user.lastStreakDate;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    if (lastDate === todayStr) {
      // Already counted today, do nothing
    } else if (lastDate === yesterdayStr) {
      user.currentStreak += 1;
      if (user.currentStreak > user.longestStreak) user.longestStreak = user.currentStreak;
      user.lastStreakDate = todayStr;
    } else {
      // Missed a day, reset streak
      user.currentStreak = 1;
      user.lastStreakDate = todayStr;
    }
    await user.save();
  }
  return Response.json(newTask);
}

export async function PUT(req) {
  await connect();
  let userId;
  try {
    userId = getDataFromToken(req);
  } catch (err) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  // If marking as completed (case-insensitive), update updatedAt to now
  let streakUpdated = false;
  if (body.status && body.status.toLowerCase() === "completed") {
    body.updatedAt = Date.now();
    streakUpdated = true;
  }
  // Only allow update if the task belongs to the user
  const updatedTask = await Task.findOneAndUpdate({ _id: body._id, userId }, body, { new: true });
  if (!updatedTask) {
    return Response.json({ error: "Task not found or unauthorized" }, { status: 404 });
  }
  // Streak logic for completion
  if (streakUpdated) {
    const User = require("@/models/userModel").default;
    const todayStr = new Date().toISOString().slice(0, 10);
    const user = await User.findById(userId);
    let streakJustStarted = false;
    if (user) {
      const lastDate = user.lastStreakDate;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      if (lastDate === todayStr) {
        // Already counted today, do nothing
      } else if (lastDate === yesterdayStr) {
        user.currentStreak += 1;
        if (user.currentStreak > user.longestStreak) user.longestStreak = user.currentStreak;
        user.lastStreakDate = todayStr;
        streakJustStarted = true;
      } else {
        user.currentStreak = 1;
        user.lastStreakDate = todayStr;
        streakJustStarted = true;
      }
      await user.save();
    }
    // If streak just started for today, delete all previous days' completed tasks
    if (streakJustStarted) {
      await Task.deleteMany({
        userId,
        status: "completed",
        updatedAt: { $lt: new Date(todayStr) }
      });
    }
  }
  return Response.json(updatedTask);
}

export async function DELETE(req) {
  await connect();
  let userId;
  try {
    userId = getDataFromToken(req);
  } catch (err) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  // Only allow delete if the task belongs to the user
  const deletedTask = await Task.findOneAndDelete({ _id: body._id, userId });
  if (!deletedTask) {
    return Response.json({ error: "Task not found or unauthorized" }, { status: 404 });
  }
  return Response.json({ success: true });
}
