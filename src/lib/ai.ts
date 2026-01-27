import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { z } from "zod";

// Zod schema for validation
const ReflectionSchema = z.object({
    wins: z.array(z.string()),
    pending: z.array(z.string()),
    suggestion: z.string(),
});

export type DailyStats = {
    activeTasks: number;
    completedTasks: string[];
    pendingTasks: string[];
    focusMinutes: number;
    noteContent?: string;
};

// Fallback generator (deterministic)
function generateFallbackReflection(stats: DailyStats) {
    const wins = stats.completedTasks.length > 0
        ? stats.completedTasks.slice(0, 3)
        : ["Made progress on daily goals", "Maintained focus today"];

    const pending = stats.pendingTasks.length > 0
        ? stats.pendingTasks.slice(0, 3)
        : ["Plan tomorrow's priorities"];

    let suggestion = "Take a moment to plan your next day for better clarity.";
    if (stats.focusMinutes > 60) suggestion = "Great focus today! rigorous work deserves rest.";
    else if (stats.activeTasks > 5) suggestion = "Try to prioritize just 3 main tasks tomorrow to avoid overwhelm.";

    return { wins, pending, suggestion };
}

export async function generateDailyReflection(stats: DailyStats) {
    const prompt = `
    You are a professional productivity assistant. Analyze the user's daily activity and generate a brief daily reflection.
    
    DATA:
    - Completed Tasks: ${JSON.stringify(stats.completedTasks)}
    - Pending Tasks: ${JSON.stringify(stats.pendingTasks)}
    - Focus Time: ${stats.focusMinutes} minutes
    - Daily Note: "${stats.noteContent || 'None'}"

    REQUIREMENTS:
    1. Identify 2-3 specific "Wins" (completed tasks or focus milestones).
    2. List 1-2 important "Pending" items to carry over.
    3. Provide ONE short, practical suggestion for tomorrow (1 sentence).
    4. Tone: Professional, encouraging, concise. NO generic fluff.
    5. OUTPUT VALID JSON ONLY. No markdown code blocks.

    JSON FORMAT:
    {
      "wins": ["win 1", "win 2"],
      "pending": ["pending 1"],
      "suggestion": "suggestion string"
    }
  `;

    // 1. Try Google Gemini
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
        try {
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            const parsed = JSON.parse(text);
            const validated = ReflectionSchema.safeParse(parsed);
            if (validated.success) return validated.data;
        } catch (error) {
            console.error("Gemini AI Error:", error);
            // Fall through to Groq
        }
    }

    // 2. Try Groq
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
        try {
            const groq = new Groq({ apiKey: groqKey });
            const chatCompletion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt + " Respond in JSON only." }],
                model: "llama3-8b-8192",
                temperature: 0.3,
                response_format: { type: "json_object" },
            });
            const content = chatCompletion.choices[0]?.message?.content || "{}";
            const parsed = JSON.parse(content);
            const validated = ReflectionSchema.safeParse(parsed);
            if (validated.success) return validated.data;
        } catch (error) {
            console.error("Groq AI Error:", error);
            // Fall through to fallback
        }
    }

    // 3. Fallback
    console.log("Using deterministic fallback for daily reflection.");
    return generateFallbackReflection(stats);
}
