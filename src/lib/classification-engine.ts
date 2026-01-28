
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { z } from "zod";

// Define the valid Priority type explicitly matching taskModel
type Priority = "High" | "Medium" | "Low";

export interface ClassificationResult {
    tag?: string;
    priority?: Priority;
    source: "rule" | "ai" | "manual";
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
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" },
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
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

    private async askAi(text: string): Promise<{ tag?: string; priority?: Priority }> {
        if (!this.model) return {};

        const prompt = `Classify this task into a short 'tag' (1 word, capitalized) and 'priority' (High, Medium, Low).
Task: "${text}"
Rules:
- Map sports (cricket, football, etc.) to 'Fitness'.
- Map career/jobs (interview, meeting) to 'Work'.
- Map chores to 'Chores'.
- Map personal/intimate activities to 'Personal' or 'Health'.
Return strictly JSON format: { "tag": "...", "priority": "..." }`;

        try {
            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();

            console.log("ClassificationEngine: Raw AI Response ->", responseText);

            // Robust JSON Extraction: Find first '{' and last '}'
            const start = responseText.indexOf('{');
            const end = responseText.lastIndexOf('}');

            let jsonString = responseText;
            if (start !== -1 && end !== -1) {
                jsonString = responseText.substring(start, end + 1);
            }

            // Parse and Validate
            const parsed = JSON.parse(jsonString);
            const validated = AiResponseSchema.safeParse(parsed);

            if (validated.success) {
                return validated.data;
            } else {
                console.warn("ClassificationEngine: Invalid AI response schema", validated.error);
                return { tag: "General", priority: "Medium" };
            }
        } catch (e: any) {
            console.error("ClassificationEngine: AI generation failed", e);
            return { tag: "General", priority: "Medium" };
        }
    }
}
