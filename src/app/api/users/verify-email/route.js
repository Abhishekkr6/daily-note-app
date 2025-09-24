import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

export async function POST(req) {
  await connect();
  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }
  const user = await User.findOne({
    emailVerificationExpires: { $gt: Date.now() },
  });
  if (!user) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }
  const bcryptjs = (await import("bcryptjs")).default;
  const valid = await bcryptjs.compare(token, user.emailVerificationToken);
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }
  user.emailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();
  return NextResponse.json({ message: "Email verified successfully" });
}
