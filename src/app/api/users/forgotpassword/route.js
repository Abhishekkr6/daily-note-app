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
  // CSRF protection: accept token from body or x-csrf-token header
  const body = await req.json();
  const csrfToken = body.csrfToken || req.headers.get("x-csrf-token");
  const email = body.email;
  const cookieCsrfToken = req.cookies.get("csrfToken")?.value;
  if (!verifyCSRFToken(csrfToken, cookieCsrfToken)) {
    console.warn("CSRF verification failed for forgotpassword", {
      provided: csrfToken ? csrfToken.slice(0, 8) + "..." : null,
      cookie: cookieCsrfToken ? cookieCsrfToken.slice(0, 8) + "..." : null,
      ip,
      path: req.url || "/api/users/forgotpassword",
    });
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }
  try {
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }
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
    return NextResponse.json({ message: "Reset link sent to your email." });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
