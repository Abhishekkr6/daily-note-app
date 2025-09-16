import { connect } from "../../../../dbConfig/dbConfig.js";
import User from "../../../../models/userModel.js";
import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../../../../helpers/mailer.js";

connect();

export async function POST(req) {
  try {
    const reqBody = await req.json(); 
    const { username, email, password } = reqBody;
    console.log("Request body:", reqBody);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    console.log("Saved user:", savedUser);

    // send verification email
    await sendEmail({
      email,
      emailType: "VERIFY",
      userId: savedUser._id,
    });

    return NextResponse.json({
      message: "User registered successfully",
      success: true,
      user: savedUser,
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
