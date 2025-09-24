import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { generateTOTPSecret } from "@/utils/totp";

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
  if (user.twoFactorEnabled) {
    return NextResponse.json({ error: "2FA already enabled" }, { status: 400 });
  }
  const secret = generateTOTPSecret();
  user.twoFactorSecret = secret;
  await user.save();
  // In production, return QR code URL for authenticator apps
  return NextResponse.json({ secret });
}
