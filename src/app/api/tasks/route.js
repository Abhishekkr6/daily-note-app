import { connect } from "@/dbConfig/dbConfig";
import Task from "@/models/taskModel";

export async function GET(req) {
  await connect();
  const tasks = await Task.find({});
  return Response.json(tasks);
}

export async function POST(req) {
  await connect();
  const body = await req.json();
  // Remove _id if present
  if (body._id) delete body._id;
  const newTask = await Task.create(body);
  return Response.json(newTask);
}

export async function PUT(req) {
  await connect();
  const body = await req.json();
  const updatedTask = await Task.findByIdAndUpdate(body._id, body, { new: true });
  return Response.json(updatedTask);
}

export async function DELETE(req) {
  await connect();
  const body = await req.json();
  await Task.findByIdAndDelete(body._id);
  return Response.json({ success: true });
}
