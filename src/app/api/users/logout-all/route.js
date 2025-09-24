import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

export async function POST(req) {
  await connect();
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  user.refreshToken = null;
  await user.save();
  // Clear cookies
  const response = NextResponse.json({ message: "Logged out from all devices" });
  response.cookies.set("authToken", "", { maxAge: 0, path: "/" });
  response.cookies.set("refreshToken", "", { maxAge: 0, path: "/api/users/refresh-token" });
  return response;
}
