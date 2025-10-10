import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import User from "@/models/userModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

export async function POST(req) {
  try {
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = getDataFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const formData = await req.formData();
    const file = formData.get("avatar");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    let result;
    try {
      result = await cloudinary.uploader.upload(base64, {
        folder: "user_avatars",
        public_id: userId,
        overwrite: true,
        resource_type: "image",
      });
    } catch (cloudErr) {
      console.error("Cloudinary upload error:", cloudErr);
      return NextResponse.json({ error: "Cloudinary upload failed", details: cloudErr.message }, { status: 500 });
    }

    if (!result || !result.secure_url) {
      return NextResponse.json({ error: "No secure_url from Cloudinary" }, { status: 500 });
    }

    // Update user avatarUrl
    const updatedUser = await User.findByIdAndUpdate(userId, { avatarUrl: result.secure_url }, { new: true });
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found for avatar update" }, { status: 404 });
    }
    return NextResponse.json({ avatarUrl: result.secure_url });
  } catch (error) {
    console.error("Avatar API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
