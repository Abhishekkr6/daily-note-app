import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connect } from "@/dbConfig/dbConfig";
import Task from "@/models/taskModel";
import { SuggestionEngine } from "@/lib/suggestion-engine";

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connect();

        const userId = token.sub || token._id;

        const tasks = await Task.find({
            userId: userId,
            status: { $ne: "completed" }
        });

        if (!tasks || tasks.length === 0) {
            return NextResponse.json({ suggestion: null });
        }

        const body = await req.json().catch(() => ({}));
        const allowAi = body.allowAi === true;

        const suggestion = await SuggestionEngine.evaluate(
            userId as string,
            tasks,
            allowAi
        );

        return NextResponse.json({ suggestion });

    } catch (error: any) {
        console.error("Smart Suggestion API Error:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}
