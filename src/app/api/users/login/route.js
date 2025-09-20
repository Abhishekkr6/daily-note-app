import nodemailer from "nodemailer";
import { connect } from "../../../../dbConfig/dbConfig.js";
import bcryptjs from "bcryptjs";
import User from "../../../../models/userModel.ts";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

connect();

export async function POST(req) {
  try {
    const reqBody = await req.json();
    const { email, password } = reqBody;
    console.log("Request body:", reqBody);

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

    const tokenData = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(tokenData, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "1d",
    });

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

    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
