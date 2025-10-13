import { connect } from "@/dbConfig/dbConfig";
import Note from "@/models/noteModel";

export async function GET(req) {
  await connect();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  // Optionally, get userId from session
  const note = await Note.findOne({ date });
  return Response.json(note || {});
}

export async function POST(req) {
  await connect();
  const body = await req.json();
  // Remove _id if present
  if (body._id) delete body._id;
  // Upsert note for the date
  const note = await Note.findOneAndUpdate(
    { date: body.date },
    { content: body.content, date: body.date },
    { upsert: true, new: true }
  );
  return Response.json(note);
}
