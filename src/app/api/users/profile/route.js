export async function PUT(req) {
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
    let user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (body.name && typeof body.name === "string" && body.name.length >= 3) {
      user.username = body.name;
    }
    if (body.timezone && typeof body.timezone === "string") {
      user.preferences.timezone = body.timezone;
    }
    if (body.workingHours && typeof body.workingHours === "object") {
      user.preferences.workingHours = body.workingHours;
      user.markModified("preferences.workingHours");
    }
    await user.save();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({
      name: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      timezone: user.preferences?.timezone,
      workingHours: user.preferences?.workingHours
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import User from "@/models/userModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

export async function GET(req) {
  try {
    // Get token from cookies
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Get userId from token
    const userId = getDataFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    // Find user in DB
    const user = await User.findById(userId).select("username email avatarUrl preferences");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({
      name: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      timezone: user.preferences?.timezone,
      workingHours: user.preferences?.workingHours || { start: "09:00", end: "17:00" }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
