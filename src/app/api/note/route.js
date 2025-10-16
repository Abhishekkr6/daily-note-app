import { connect } from "@/dbConfig/dbConfig";
import Note from "@/models/noteModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

export async function GET(req) {
  await connect();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date) return Response.json({ error: "Missing date" }, { status: 400 });
  let userId;
  try {
    userId = getDataFromToken(req);
  } catch (err) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const note = await Note.findOne({ date, userId });
  return Response.json(note || {});
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
  if (!body.date) return Response.json({ error: "Missing date" }, { status: 400 });
  // Remove _id if present
  if (body._id) delete body._id;

  // Upsert note for the date scoped to userId
  const note = await Note.findOneAndUpdate(
    { date: body.date, userId },
    { content: body.content, date: body.date, userId },
    { upsert: true, new: true }
  );
  return Response.json(note);
}
