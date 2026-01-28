
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

// --- Configuration ---

const PRIORITY_RULES = [
    { keywords: ["urgent", "asap", "immediate", "critical", "deadline", "important", "interview"], value: "High" },
    { keywords: ["later", "someday", "whenever", "low priority"], value: "Low" },
    { keywords: ["normal", "medium"], value: "Medium" },
] as const;

const TAG_RULES = [
    { keywords: ["call", "phone", "email", "message", "text", "reach out", "zoom", "teams"], value: "Communication" },
    { keywords: ["gym", "workout", "run", "exercise", "fitness", "yoga", "walk", "sport", "play", "game", "match"], value: "Fitness" },
    { keywords: ["buy", "purchase", "order", "groceries", "shop", "store", "amazon"], value: "Shopping" },
    { keywords: ["read", "study", "learn", "course", "book", "research", "article"], value: "Learning" },
    { keywords: ["cook", "dinner", "lunch", "breakfast", "meal", "food"], value: "Food" },
    { keywords: ["clean", "wash", "tidy", "organize", "laundry", "chore", "trash"], value: "Chores" },
    { keywords: ["pay", "bill", "bank", "transfer", "money", "finance", "tax"], value: "Finance" },
    { keywords: ["doctor", "dentist", "appointment", "checkup", "meds", "pill"], value: "Health" },
    { keywords: ["meeting", "sync", "standup", "presentation", "report", "interview", "job", "career", "deadline", "project", "submit", "review", "slide", "code", "deploy"], value: "Work" },
] as const;

// Define the valid Priority type explicitly matching taskModel
type Priority = "High" | "Medium" | "Low";

export interface ClassificationResult {
    tag?: string;
    priority?: Priority;
    source: "rule" | "ai" | "manual"; // 'manual' isn't returned by auto-classify but fits the type
}

// Zod schema for AI response validation
const AiResponseSchema = z.object({
    tag: z.string().optional(),
    priority: z.enum(["High", "Medium", "Low"]).optional(),
});

export class ClassificationEngine {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        if (!apiKey) {
            console.warn("ClassificationEngine: API key is missing. AI fallback will fail.");
        }
        this.genAI = new GoogleGenerativeAI(apiKey || "");
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" } // Force JSON
        });
    }

    /**
     * Main entry point to classify a task.
     * Tries rules first, then falls back to AI.
     */
    async classify(text: string): Promise<ClassificationResult> {
        // User Request: "Use AI for everything"
        // We skip local rule-based matching primarily and rely on Gemini.

        try {
            console.log("ClassificationEngine: Sending to AI ->", text);
            const aiResult = await this.askAi(text);
            return {
                ...aiResult,
                source: "ai"
            };

        } catch (error) {
            console.error("ClassificationEngine AI Error:", error);
            // Fallback default only if AI fails
            return {
                tag: "General",
                priority: "Medium",
                source: "rule" // Technically 'fallback'
            };
        }
    }

    // Rule-based matching removed in favor of AI-only approach
    // private applyRules(text: string) { ... }

    private async askAi(text: string): Promise<{ tag?: string; priority?: Priority }> {
        if (!this.model) return {};

        const prompt = `Classify this task into a short 'tag' (1 word, capitalized) and 'priority' (High, Medium, Low).
Task: "${text}"
Rules:
- Map sports (cricket, football, etc.) to 'Fitness'.
- Map career/jobs (interview, meeting) to 'Work'.
- Map chores to 'Chores'.
Return strictly JSON format: { "tag": "...", "priority": "..." }`;

        try {
            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();

            // Parse and Validate
            const parsed = JSON.parse(responseText);
            const validated = AiResponseSchema.safeParse(parsed);

            if (validated.success) {
                return validated.data;
            } else {
                console.warn("ClassificationEngine: Invalid AI response schema", validated.error);
                return { tag: "General", priority: "Medium" };
            }
        } catch (e) {
            console.error("ClassificationEngine: AI generation failed", e);
            return { tag: "General", priority: "Medium" };
        }
    }
}
