import User from "@/models/userModel.ts";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import mongoose from "mongoose";

export async function POST(req) {
  await connect();
  console.log('Mongoose connection state:', mongoose.connection.readyState); // 1=connected, 0=disconnected
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ error: "Token and password required" }, { status: 400 });
    }
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
