import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import User from "@/models/userModel";
import Task from "@/models/taskModel";
import Note from "@/models/noteModel";
import Mood from "@/models/moodModel";
import Pomodoro from "@/models/pomodoroModel";
import Template from "@/models/templateModel";
import ScoreEvent from "@/models/scoreEventModel";
import LeaderboardEntry from "@/models/leaderboardModel";
import { connect } from "@/dbConfig/dbConfig";

// Connect to database
connect();

/**
 * DELETE /api/users/delete-all-data
 * Delete all user data from all collections and the user account itself
 */
export async function DELETE(req) {
  try {
    // Get user from token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = token.id;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete all user data from all collections
    await Promise.all([
      Task.deleteMany({ userId: userId }),
      Note.deleteMany({ userId: userId }),
      Mood.deleteMany({ userId: userId }),
      Pomodoro.deleteMany({ userId: userId }),
      Template.deleteMany({ userId: userId }),
      ScoreEvent.deleteMany({ userId: userId }),
      LeaderboardEntry.deleteMany({ userId: userId }),
    ]);

    // Finally, delete the user account
    await User.findByIdAndDelete(userId);

    // Clear the auth cookie
    const response = NextResponse.json({
      message: "All data deleted successfully",
      success: true,
    });

    response.cookies.set("authToken", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    return response;
  } catch (error) {
    console.error("Error deleting user data:", error);
    return NextResponse.json(
      { error: "Failed to delete user data", details: error.message },
      { status: 500 }
    );
  }
}
