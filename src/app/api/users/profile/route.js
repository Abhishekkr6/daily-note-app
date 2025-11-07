import { NextResponse } from "next/server";
import User from "@/models/userModel";
import { getToken } from "next-auth/jwt";

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = token.id;
    const user = await User.findById(userId).select("username email avatarUrl preferences");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
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

export async function PUT(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = token.id;
    const body = await req.json();
    let user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
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
