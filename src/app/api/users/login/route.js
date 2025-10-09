import nodemailer from "nodemailer";
import { connect } from "../../../../dbConfig/dbConfig.js";
import bcryptjs from "bcryptjs";
import User from "../../../../models/userModel.ts";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { rateLimit } from "../../../../utils/rateLimit.js";
import { verifyCSRFToken } from "../../../../utils/csrf.js";
import { signAccessToken, signRefreshToken } from "../../../../utils/token.js";
import { needsRehash } from "../../../../helpers/rehashCheck.js";

connect();

export async function POST(req) {
    // Rate limiting (per IP)
    const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown";
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
  try {
    const reqBody = await req.json();
    const { email, password, csrfToken } = reqBody;
    // Double-submit CSRF protection
    const cookieCsrfToken = req.cookies.get("csrfToken")?.value;
    if (!verifyCSRFToken(csrfToken, cookieCsrfToken)) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "User does not exists" },
        { status: 400 }
      );
    }

    console.log("User exists");


    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Check your credentials" },
        { status: 400 }
      );
    }
    // Password rehashing if cost factor increased
    if (needsRehash(user.password, 12)) {
      const newHash = await bcryptjs.hash(password, 12);
      user.password = newHash;
      await user.save();
    }

    const tokenData = {
      id: user._id,
      username: user.username,
      email: user.email,
    };
  // Short-lived access token (15m)
  const accessToken = signAccessToken(tokenData);
  // Long-lived refresh token (7d)
  const refreshToken = signRefreshToken({ id: user._id });
  // Store hashed refresh token in DB for rotation/revocation
  const refreshTokenHash = await bcryptjs.hash(refreshToken, 12);
  user.refreshToken = refreshTokenHash;
  await user.save();

    // ✅ Email bhejne ke liye transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASS,
      },
    });

    // ✅ Login success email
    await transporter.sendMail({
      from: `"Daily Note App" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Login Successful 🎉",
      text: `Hi ${user.username}, you have successfully logged in to Daily Note.`,
      html: `<p>Hi <b>${user.username}</b>,</p>
             <p>You have successfully logged in to <b>Daily Note</b>.</p>
             <p>Time: ${new Date().toLocaleString()}</p>`,
    });

    const response = NextResponse.json({
      message: "Logged In Success & Email Sent",
      success: true,
    });
    // Set access token (short-lived)
    response.cookies.set("authToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      path: "/",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
    });
    // Set refresh token (long-lived)
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/api/users/refresh-token", // Only sent to refresh endpoint
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
