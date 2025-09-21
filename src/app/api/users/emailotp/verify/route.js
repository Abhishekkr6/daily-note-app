import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

export async function POST(req) {
  const body = await req.json();
  const { email, otp } = body;
  if (!email || !otp) {
    return new Response(JSON.stringify({ error: "Email and OTP are required" }), { status: 400 });
  }
  try {
    await client.connect();
    const db = client.db();
    const otps = db.collection("email_otps");
    const record = await otps.findOne({ email });
    if (!record) {
      return new Response(JSON.stringify({ error: "No OTP found for this email" }), { status: 400 });
    }
    if (record.otp !== otp) {
      return new Response(JSON.stringify({ error: "Invalid OTP" }), { status: 400 });
    }
    if (Date.now() > record.expiresAt) {
      return new Response(JSON.stringify({ error: "OTP expired" }), { status: 400 });
    }
    await otps.deleteOne({ email });
    return new Response(JSON.stringify({ message: "OTP verified successfully" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to verify OTP" }), { status: 500 });
  } finally {
    await client.close();
  }
}
