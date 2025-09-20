import { connect } from "../../../../dbConfig/dbConfig.js";
import User from "../../../../models/userModel.ts";
import { NextResponse, NextRequest } from "next/server";
import { getDataFromToken } from "../../../../helpers/getDataFromToken.js";

connect();

export async function POST(req) {
   const userId = await getDataFromToken(req)
   const user = await User.findOne({_id: userId}).select("-password").lean()
   return NextResponse.json({
    message: "User found",
    data: user
   })
}