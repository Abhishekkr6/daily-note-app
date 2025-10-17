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
  const tasks = await Task.find({ userId });
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
  if (body.status && body.status.toLowerCase() === "completed") {
    body.updatedAt = Date.now();
  }
  // Only allow update if the task belongs to the user
  const updatedTask = await Task.findOneAndUpdate({ _id: body._id, userId }, body, { new: true });
  if (!updatedTask) {
    return Response.json({ error: "Task not found or unauthorized" }, { status: 404 });
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
