import { connect } from "../../../../dbConfig/dbConfig.js";
import User from "../../../../models/userModel.ts";
import { NextResponse } from "next/server";

connect();

export async function POST(req) {
  try {
    const { email } = await req.json();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }
    return NextResponse.json({ exists: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
