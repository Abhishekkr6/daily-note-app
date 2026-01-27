
// Usage: npx tsx scripts/test-ai-logic.ts

import { generateDailyReflection, DailyStats } from "../src/lib/ai";

async function main() {
    console.log("Testing generateDailyReflection (Fallback expected if no keys)...");

    // Mock data
    const stats: DailyStats = {
        activeTasks: 2,
        completedTasks: ["Fix bug #123", "Write documentation"],
        pendingTasks: ["Deploy to prod", "Email client"],
        focusMinutes: 45,
        noteContent: "Today was productive but tiring."
    };

    try {
        const result = await generateDailyReflection(stats);
        console.log("Result:", JSON.stringify(result, null, 2));

        if (result.wins.length > 0 && result.suggestion) {
            console.log("PASS: Generated valid reflection structure");
        } else {
            console.error("FAIL: Invalid structure");
            process.exit(1);
        }
    } catch (error) {
        console.error("FAIL: Error running generator", error);
        process.exit(1);
    }
}

main();
