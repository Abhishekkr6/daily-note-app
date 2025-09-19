import { connect } from "../../../../dbConfig/dbConfig.js";
import User from "../../../../models/userModel.js";
import { NextResponse } from "next/server";
import { sendEmail } from "../../../../helpers/mailer.js";

connect();

export async function POST(request) {
  try {
    const reqBody = await request.json();
    const { token, email } = reqBody;
    console.log("Token received:", token);

    // ✅ User find karo jiska token valid ho aur expire na hua ho
    const user = await User.findOne({
      email,
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // ✅ Verify success
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    console.log("Email Verified");

    // ✅ Verification success hone ke baad ek confirmation mail bhejo
    await sendEmail({
      to: email,
      subject: "✅ Email Verified Successfully",
      text: "Your Daily Note account email has been verified successfully.",
      html: `<h2>Email Verified</h2><p>Hi ${user.username}, your email has been successfully verified 🎉</p>`,
    });

    return NextResponse.json(
      { message: "Email verified successfully", success: true },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
