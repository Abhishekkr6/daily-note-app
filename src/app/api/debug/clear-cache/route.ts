
import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import DailyReflection from "@/models/dailyReflectionModel";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connect();
        const today = new Date().toISOString().slice(0, 10);

        const result = await DailyReflection.deleteOne({ date: today });

        return NextResponse.json({
            message: "Cache Clear Attempted",
            date: today,
            deletedCount: result.deletedCount,
            status: result.deletedCount > 0 ? "✅ SUCCESS: Cache cleared. You can Generate again." : "ℹ️ INFO: No cache found for today."
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
