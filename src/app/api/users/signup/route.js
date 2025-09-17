import { connect } from "../../../../dbConfig/dbConfig.js";
import User from "../../../../models/userModel.js";
import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../../../../helpers/mailer.js";

connect();

export async function POST(req) {
  try {
    const reqBody = await req.json();
    const { username, email, password, confirmPassword } = reqBody;
    console.log("Request body:", reqBody);

    // ✅ Required fields check
    if (!username || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // ✅ Confirm password check
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // ✅ Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // ✅ Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // ✅ Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // ✅ Create user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    console.log("Saved user:", savedUser);

    // ✅ Send verification email
    await sendEmail({
      email,
      emailType: "VERIFY",
      userId: savedUser._id,
    });

    return NextResponse.json({
      message: "User registered successfully. Please verify your email.",
      success: true,
      user: {
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error.message);

    // ✅ Handle Mongo duplicate key error
    if (error.code === 11000) {
      const dupField = Object.keys(error.keyValue)[0];
      return NextResponse.json(
        { error: `${dupField} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
