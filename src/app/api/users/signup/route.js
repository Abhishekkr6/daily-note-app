import { connect } from "../../../../dbConfig/dbConfig.js";
import User from "../../../../models/userModel.ts";
import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../../../../helpers/mailer.js";

connect();

export async function POST(req) {
  try {
    const reqBody = await req.json();
    const { username, email, password, confirmPassword } = reqBody;

    if (!username || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // ✅ Verification token generate
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      emailVerificationToken,
      emailVerificationExpires,
    });

    const savedUser = await newUser.save();

    // ✅ Verification Email bhejo
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${emailVerificationToken}`;
    await sendEmail({
      email,
      subject: "Verify your email",
      html: `<p>Hi ${username},</p>
             <p>Please verify your email by clicking below link:</p>
             <a href="${verifyUrl}">Verify Email</a>`,
    });

    return NextResponse.json({
      message: "User registered successfully. Please check your email to verify.",
      success: true,
    });
  } catch (error) {
    console.error("Signup error:", error);

    if (error.code === 11000) {
      const dupField = Object.keys(error.keyValue)[0];
      return NextResponse.json({ error: `${dupField} already exists` }, { status: 400 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
