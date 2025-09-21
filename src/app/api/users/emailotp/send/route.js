import nodemailer from "nodemailer";
import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

export async function POST(req) {
  const body = await req.json();
  const { email } = body;
  if (!email) {
    return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    await client.connect();
    const db = client.db();
    const otps = db.collection("email_otps");
    await otps.updateOne(
      { email },
      { $set: { otp, expiresAt: Date.now() + 10 * 60 * 1000 } },
      { upsert: true }
    );
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SMTP_HOST,
      port: process.env.EMAIL_SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Your DailyNote Email Verification OTP",
      text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
    });
    return new Response(JSON.stringify({ message: "OTP sent successfully" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to send OTP" }), { status: 500 });
  } finally {
    await client.close();
  }
}
