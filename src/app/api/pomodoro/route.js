import { connect } from "@/dbConfig/dbConfig";
import Pomodoro from "@/models/pomodoroModel";

export async function GET(req) {
  await connect();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  // Optionally, get userId from session
  const pomodoro = await Pomodoro.findOne({ date });
  return Response.json(pomodoro || {});
}

export async function POST(req) {
  await connect();
  const body = await req.json();
  // Remove _id if present
  if (body._id) delete body._id;
  // Upsert pomodoro for the date
  const pomodoro = await Pomodoro.findOneAndUpdate(
    { date: body.date },
    { cycles: body.cycles, duration: body.duration, date: body.date },
    { upsert: true, new: true }
  );
  return Response.json(pomodoro);
}
