// Scheduled email notification sender for tasks (TypeScript)

import Task from "../src/models/taskModel";
import { connect } from "../src/dbConfig/dbConfig";

async function connectDB() {
  await connect();
}

async function sendNotifications() {
  try {
    await connectDB();
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
    const todayStr = now.toISOString().slice(0, 10);

    // Find all tasks for today with notificationTime matching current time
    const tasks = await Task.find({
      notificationTime: currentTime,
      status: "today",
      dueDate: todayStr,
    });
  } catch (err) {
    console.error("General error in sendNotifications:", err);
  }
}

