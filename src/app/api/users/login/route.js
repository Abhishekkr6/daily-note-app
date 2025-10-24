import { connect } from "../../../../dbConfig/dbConfig.js";
import bcryptjs from "bcryptjs";
import User from "../../../../models/userModel.ts";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { rateLimit } from "../../../../utils/rateLimit.js";
import { verifyCSRFToken } from "../../../../utils/csrf.js";
import { signAccessToken, signRefreshToken } from "../../../../utils/token.js";
import { needsRehash } from "../../../../helpers/rehashCheck.js";
import { sendEmail } from "../../../../helpers/mailer.js"; // ✅ only one import

export async function POST(req) {
  // Rate limiting (per IP)
  const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const reqBody = await req.json();
    const { email, password, csrfToken } = reqBody;

    // CSRF Protection
    const headerCsrf = req.headers.get("x-csrf-token");
    const providedToken = csrfToken || headerCsrf;
    const cookieCsrfToken = req.cookies.get("csrfToken")?.value;
    if (!verifyCSRFToken(providedToken, cookieCsrfToken)) {
      console.warn("CSRF verification failed", {
        providedToken: providedToken?.slice(0, 8) + "...",
        cookieToken: cookieCsrfToken?.slice(0, 8) + "...",
        ip,
      });
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    // User lookup
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User does not exist" }, { status: 400 });
    }

    // Password check
    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Check your credentials" }, { status: 400 });
    }

    // Password rehashing if cost factor increased
    if (needsRehash(user.password, 12)) {
      user.password = await bcryptjs.hash(password, 12);
      await user.save();
    }

    // Generate tokens
    const tokenData = { id: user._id, username: user.username, email: user.email };
    const accessToken = signAccessToken(tokenData, "30d");
    const refreshToken = signRefreshToken({ id: user._id }, "30d");
    user.refreshToken = await bcryptjs.hash(refreshToken, 12);
    await user.save();

    // ✅ Send login success email using Resend helper
    await sendEmail({
      email: user.email,
      emailType: "LOGIN_SUCCESS",
      extraData: { username: user.username, loginTime: new Date().toLocaleString() }
    });

    // Set cookies for authToken and refreshToken
    const response = NextResponse.json({
      message: "Logged In Success & Email Sent",
      success: true
    });
    response.cookies.set("authToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/api/users/refresh-token",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
