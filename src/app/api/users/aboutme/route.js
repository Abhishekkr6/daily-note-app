import { connect } from "../../../../dbConfig/dbConfig.js";
import User from "../../../../models/userModel.ts";
import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

connect();

export async function POST(req) {
    try {
       const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
       if (!token || !token.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
       const userId = token.id;
       const user = await User.findOne({_id: userId}).select("-password").lean();
       return NextResponse.json({ message: "User found", data: user });
    } catch (err) {
       return NextResponse.json({ error: err.message }, { status: 500 });
    }
}