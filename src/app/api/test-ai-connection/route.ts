
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // Ensure this runs dynamically

export async function GET() {
    const report: any = {
        timestamp: new Date().toISOString(),
        env: {
            GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "✅ Present (Hidden)" : "❌ Missing",
            GROQ_API_KEY: process.env.GROQ_API_KEY ? "✅ Present (Hidden)" : "❌ Missing",
        },
        tests: {}
    };

    // 1. Test Gemini
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
            const result = await model.generateContent("Just say 'OK'");
            const text = result.response.text();
            report.tests.gemini = { status: "✅ Success", response: text };
        } catch (error: any) {
            report.tests.gemini = { status: "❌ Failed", error: error.message };
        }
    } else {
        report.tests.gemini = { status: "⚠️ Skipped", reason: "No Key" };
    }

    // 2. Test Groq
    if (process.env.GROQ_API_KEY) {
        try {
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: "Just say 'OK'" }],
                model: "llama-3.1-8b-instant",
            });
            report.tests.groq = { status: "✅ Success", response: completion.choices[0]?.message?.content };
        } catch (error: any) {
            report.tests.groq = { status: "❌ Failed", error: error.message };
        }
    } else {
        report.tests.groq = { status: "⚠️ Skipped", reason: "No Key" };
    }

    return NextResponse.json(report, { status: 200 });
}
