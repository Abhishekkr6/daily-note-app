import User from "@/models/userModel.ts";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { sendEmail } from "@/helpers/mailer";
import { connect } from "@/dbConfig/dbConfig";
import { rateLimit } from "@/utils/rateLimit.js";
import { verifyCSRFToken } from "@/utils/csrf.js";

export async function POST(req) {
  await connect();
  // Rate limiting (per IP)
  const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }
  // CSRF protection
  const { csrfToken, email } = await req.json();
  const cookieCsrfToken = req.cookies.get("csrfToken")?.value;
  if (!verifyCSRFToken(csrfToken, cookieCsrfToken)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }
  try {
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const user = await User.findOne({ email });
    if (user) {
      // Generate token
      const token = crypto.randomBytes(32).toString("hex");
      const bcryptjs = (await import("bcryptjs")).default;
      const tokenHash = await bcryptjs.hash(token, 12);
      user.resetPasswordToken = tokenHash;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();
      // Send email
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${user.email}`;
      await sendEmail({
        email: user.email,
        emailType: "RESET",
        userId: user._id,
        token,
        resetUrl,
      });
    }
    // Always return generic response to prevent user enumeration
    return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
