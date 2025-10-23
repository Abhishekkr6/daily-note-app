import { sendEmail } from "../../../../../helpers/mailer.js";
import { MongoClient } from "mongodb";
import User from "../../../../../models/userModel.ts";
import { connect } from "../../../../../dbConfig/dbConfig.js";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);


export async function POST(req) {
  await connect();
  const body = await req.json();
  const { email } = body;
  if (!email) {
    return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
  }
  // Check if email exists in User collection
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return new Response(JSON.stringify({ error: "Email exists" }), { status: 400 });
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
      // ✅ Send OTP email using Resend
      await sendEmail({
        email,
        subject: "Your DailyNote Email Verification OTP",
        html: `<p>Your OTP is: <b>${otp}</b>. It is valid for 10 minutes.</p>`
      });
    return new Response(JSON.stringify({ message: "OTP sent successfully" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to send OTP" }), { status: 500 });
  } finally {
    await client.close();
  }
}
