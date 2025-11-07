import { NextResponse } from "next/server";

export async function POST() {
  // Deprecated route: refresh-token flow removed in favor of NextAuth session handling.
  return NextResponse.json(
    { error: "Deprecated: refresh-token flow removed. Use NextAuth for session handling." },
    { status: 410 }
  );
}
