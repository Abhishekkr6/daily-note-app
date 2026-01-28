import { connect } from "@/dbConfig/dbConfig";
import DailyReflection from "@/models/dailyReflectionModel";
import Task from "@/models/taskModel";
import Note from "@/models/noteModel";
import Pomodoro from "@/models/pomodoroModel";
import { generateDailyReflection, DailyStats } from "@/lib/ai";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connect();

        // 1. Authentication
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token || !token.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = token.id;

        // 2. Date Setup (Local time approximation or UTC? Project seems to use YYYY-MM-DD strings)
        // We'll use the server's current date for simplicity, or accept a date query param.
        // Ideally, we respect the user's timezone, but for now we default to server date string.
        // If the client sends ?date=YYYY-MM-DD, we use that.
        const url = new URL(req.url);
        const dateParam = url.searchParams.get("date");
        const today = new Date();
        const todayStr = dateParam || today.toISOString().slice(0, 10);

        // 3. Check Cache
        const existingReflection = await DailyReflection.findOne({ userId, date: todayStr });
        if (existingReflection) {
            return NextResponse.json(existingReflection);
        }

        const onlyExisting = url.searchParams.get("onlyExisting");
        if (onlyExisting === "true") {
            // If explicit check, return 404 so frontend knows to show "Generate" button
            return NextResponse.json({ error: "No reflection found" }, { status: 404 });
        }

        // 4. Gather Data for AI
        // a. Completed Tasks Today
        const completedTasksDocs = await Task.find({
            userId,
            status: "completed",
            completedDate: todayStr,
        }).select("title");
        const completedTasks = completedTasksDocs.map((t) => t.title);

        // b. Pending Tasks (Due today or overdue, not completed)
        // We look for tasks where status is NOT completed, and dueDate is <= todayStr
        const pendingTasksDocs = await Task.find({
            userId,
            status: { $ne: "completed" },
            // Simple logic: due date is today or earlier. 
            // Note: 'overdue' tasks might have status='overdue' as well.
            $or: [
                { status: 'today' },
                { status: 'overdue' }
            ]
        }).select("title");
        // Filter purely by strings might be safer if status logic is complex, 
        // but the request said "Pending tasks".
        const pendingTasks = pendingTasksDocs.map((t) => t.title);

        // c. Note Content
        const noteDoc = await Note.findOne({ userId, date: todayStr });
        const noteContent = noteDoc ? noteDoc.content : "";

        // d. Focus Time
        // Sum duration of all pomodoro sessions for this date
        const pomodoros = await Pomodoro.find({ userId, date: todayStr });
        const focusMinutes = pomodoros.reduce((total, p) => total + (p.duration || 0), 0);

        const stats: DailyStats = {
            activeTasks: pendingTasks.length,
            completedTasks,
            pendingTasks,
            focusMinutes,
            noteContent,
        };

        // 5. Generate Reflection
        const reflectionData = await generateDailyReflection(stats);

        // 6. Save to DB
        const newReflection = await DailyReflection.create({
            userId,
            date: todayStr,
            ...reflectionData,
        });

        return NextResponse.json(newReflection);
    } catch (error: any) {
        console.error("Daily Reflection API Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
