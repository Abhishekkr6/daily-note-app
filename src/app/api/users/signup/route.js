import { connect } from "../../../../dbConfig/dbConfig.js";
import User from "../../../../models/userModel.js";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from 'bcryptjs';

connect();

export async function POST() {
  try {
    const reqBody = NextRequest.json()
    const {username, email, password} = reqBody
    console.log(reqBody);
    
    const User = await User.findOne({email})

    if (User) {
        return NextResponse.json({error: "User already exists"}, {status: 400})
    }

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
