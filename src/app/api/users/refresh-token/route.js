import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/utils/token";

export async function POST(req) {
  await connect();
  const refreshToken = req.cookies.get("refreshToken")?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }
  const user = await User.findById(payload.id);
  const bcryptjs = (await import("bcryptjs")).default;
  const valid = user && await bcryptjs.compare(refreshToken, user.refreshToken);
  if (!user || !valid) {
    return NextResponse.json({ error: "Refresh token revoked" }, { status: 401 });
  }
  // Invalidate old token before issuing new one (race protection)
  user.refreshToken = null;
  await user.save();
  // Rotate refresh token
  const newRefreshToken = signRefreshToken({ id: user._id });
  const newRefreshTokenHash = await bcryptjs.hash(newRefreshToken, 12);
  user.refreshToken = newRefreshTokenHash;
  await user.save();
  // Issue new access token
  const accessToken = signAccessToken({ id: user._id, username: user.username, email: user.email });
  const response = NextResponse.json({ success: true });
  response.cookies.set("authToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 15 * 60,
  });
  response.cookies.set("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/api/users/refresh-token",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
  });
  return response;
}
