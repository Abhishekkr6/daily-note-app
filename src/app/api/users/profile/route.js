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
    const { name } = body;
    if (!name || typeof name !== "string" || name.length < 3) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    const user = await User.findByIdAndUpdate(userId, { username: name }, { new: true });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ name: user.username, email: user.email, avatarUrl: user.avatarUrl });
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
    const user = await User.findById(userId).select("username email avatarUrl");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ name: user.username, email: user.email, avatarUrl: user.avatarUrl });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
