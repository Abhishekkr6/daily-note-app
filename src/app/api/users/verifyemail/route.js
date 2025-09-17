import { connect } from "../../../../dbConfig/dbConfig.js";
import User from "../../../../models/userModel.js";
import bcryptjs from "bcryptjs";
import { NextResponse } from "next/server";

connect();

export async function POST(request) {
  try {
    const reqBody = await request.json();
    const { token, email } = reqBody;
    console.log("Token received:", token);

    // Find user by email and check expiry
    const user = await User.findOne({
      email,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Compare plain token with hashed token
    const isMatch = await bcryptjs.compare(token, user.emailVerificationToken);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    console.log("Email Verified");

    return NextResponse.json(
      { message: "Email verified successfully", success: true },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
