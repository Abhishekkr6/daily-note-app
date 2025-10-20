import { NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";

// GET: fetch notification settings from DB using userId from token
export async function GET(req) {
  await connect();
  try {
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = getDataFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ notifications: user.notifications || null });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: save notification settings to DB using userId from token
export async function PUT(req) {
  await connect();
  try {
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = getDataFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const body = await req.json();
    const { notifications } = body;
    if (!notifications) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { notifications } },
      { new: true }
    );
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
