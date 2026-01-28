
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
    { keywords: ["gym", "workout", "run", "exercise", "fitness", "yoga", "walk", "sport"], value: "Fitness" },
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
        const normalizedText = text.toLowerCase();

        // 1. Try Rule-based matching
        const ruleResult = this.applyRules(normalizedText);

        // If we have both, we're done (fast path)
        if (ruleResult.tag && ruleResult.priority) {
            return { ...ruleResult, source: "rule" };
        }

        // 2. Fallback to AI if missing fields
        try {
            // Only ask AI for what's missing, or refine? 
            // Simple strategy: If *any* rule matched, use it. If *nothing* matched, use AI.
            // Or hybrid: Use rule for priority if found, ask AI for tag?
            // Requirement says: "If at least one rule matches -> skip AI"
            if (ruleResult.tag || ruleResult.priority) {
                return { ...ruleResult, source: "rule" };
            }

            const aiResult = await this.askAi(text);
            return { ...aiResult, source: "ai" };

        } catch (error) {
            console.error("ClassificationEngine AI Error:", error);
            // Fallback to whatever rules we found or empty
            return { ...ruleResult, source: "rule" };
        }
    }

    private applyRules(text: string): { tag?: string; priority?: Priority } {
        let tag: string | undefined;
        let priority: Priority | undefined;

        // Check Tags
        for (const rule of TAG_RULES) {
            if (rule.keywords.some(k => text.includes(k))) {
                tag = rule.value;
                break; // First match wins for simplicity
            }
        }

        // Check Priority
        for (const rule of PRIORITY_RULES) {
            if (rule.keywords.some(k => text.includes(k))) {
                priority = rule.value as Priority;
                break;
            }
        }

        return { tag, priority };
    }

    private async askAi(text: string): Promise<{ tag?: string; priority?: Priority }> {
        if (!this.model) return {};

        const prompt = `Classify this task into a short 'tag' (1 word, capitalized) and 'priority' (High, Medium, Low).
Task: "${text}"
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
                return {};
            }
        } catch (e) {
            console.error("ClassificationEngine: AI generation failed", e);
            return {};
        }
    }
}
