import User from "@/models/userModel.ts";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import mongoose from "mongoose";

export async function POST(req) {
  await connect();
  console.log('Mongoose connection state:', mongoose.connection.readyState); // 1=connected, 0=disconnected
  try {
    const { token, password, email } = await req.json();
    console.log('Reset password request:', { token, email });
    if (!token || !password || !email) {
      console.log('Missing token, password, or email');
      return NextResponse.json({ error: "Token, email, and password required" }, { status: 400 });
    }
    // Find user by email and valid resetPasswordExpires
    const user = await User.findOne({
      email,
      resetPasswordExpires: { $gt: Date.now() },
      resetPasswordToken: { $ne: null },
    });
    if (!user) {
      console.log('No user found for email or token expired:', email);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }
    console.log('User found:', { email: user.email, resetPasswordToken: user.resetPasswordToken, resetPasswordExpires: user.resetPasswordExpires });
    // Compare token using bcrypt hash
    const valid = await bcrypt.compare(token, user.resetPasswordToken);
    console.log('Token compare result:', valid);
    if (!valid) {
      console.log('Token hash did not match');
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }
    // Hash new password with bcrypt cost 12
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    // Revoke all sessions (refresh tokens)
    user.refreshToken = null;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    console.log('Password reset successful for:', email);
    return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
