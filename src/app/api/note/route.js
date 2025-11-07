import { connect } from "@/dbConfig/dbConfig";
import Note from "@/models/noteModel";
import { getToken } from "next-auth/jwt";

export async function GET(req) {
  await connect();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date) return Response.json({ error: "Missing date" }, { status: 400 });
  let userId;
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
    userId = token.id;
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
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
    userId = token.id;
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
