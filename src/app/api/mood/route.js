import { connect } from "@/dbConfig/dbConfig";
import Mood from "@/models/moodModel";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// GET: Get today's mood or mood history
export async function GET(req) {
  await connect();
  let userId;
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    userId = token.id;
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (date) {
    // Get mood for specific date
    const mood = await Mood.findOne({ userId, date });
    return NextResponse.json(mood || {});
  } else {
    // Get mood history (last 30 days)
    const moods = await Mood.find({ userId }).sort({ date: -1 }).limit(30);
    return NextResponse.json(moods);
  }
}

// POST: Save or update today's mood
export async function POST(req) {
  await connect();
  let userId;
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    userId = token.id;
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { date, mood, note } = body;
  if (!date || typeof mood !== "number") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  // Upsert mood for the day
  const updated = await Mood.findOneAndUpdate(
    { userId, date },
    { mood, note },
    { upsert: true, new: true }
  );
  return NextResponse.json(updated);
}
