import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { verifyTOTP } from "@/utils/totp";

export async function POST(req) {
  await connect();
  const { email, token } = await req.json();
  if (!email || !token) {
    return NextResponse.json({ error: "Email and token required" }, { status: 400 });
  }
  const user = await User.findOne({ email });
  if (!user || !user.twoFactorSecret) {
    return NextResponse.json({ error: "2FA not initialized" }, { status: 400 });
  }
  if (!verifyTOTP(token, user.twoFactorSecret)) {
    return NextResponse.json({ error: "Invalid 2FA code" }, { status: 400 });
  }
  user.twoFactorEnabled = true;
  await user.save();
  return NextResponse.json({ message: "2FA enabled successfully" });
}
