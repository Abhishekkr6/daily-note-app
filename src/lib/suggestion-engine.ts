import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { z } from "zod";
import { ITask } from "../models/taskModel";

// Zod schema for AI Suggestion validation
const AiSuggestionSchema = z.object({
    taskId: z.string(),
    reason: z.string(),
});

export type Suggestion = {
    task: ITask;
    reason: string;
};

export class SuggestionEngine {
    /**
     * Main entry point. Evaluates rules in order.
     * If a rule matches, returns immediately.
     * If no rule matches, and allowAi is true, attempts AI fallback.
     */
    static async evaluate(
        userId: string,
        tasks: ITask[],
        allowAi: boolean = false
    ): Promise<Suggestion | null> {
        // 1. Critical Rule: Overdue
        const overdue = this.checkOverdue(tasks);
        if (overdue) return overdue;

        // 2. Flow Rule: High Priority Today
        const highPriority = this.checkHighPriorityToday(tasks);
        if (highPriority) return highPriority;

        // 3. Momentum Rule: Streak Protection (if no tasks completed today)
        // We need to check completion status. 
        // Assuming 'tasks' passed here includes all relevant tasks (pending and today's completed if needed).
        // For simplicity, let's assume the caller filters 'tasks' to be incomplete tasks, 
        // but we might need a separate check for "completed today" to trigger this rule strictly.
        // However, as a general rule, if we have a low effort task available and nothing else urgent, suggest it.
        const momentum = this.checkStreakProtection(tasks);
        if (momentum) return momentum;

        // 4. Stagnant Rule: Oldest Pending
        const stagnant = this.checkOldestPending(tasks);
        if (stagnant) return stagnant;

        // 5. AI Fallback
        if (allowAi) {
            return await this.aiEvaluate(tasks);
        }

        return null;
    }

    // --- Rules ---

    private static checkOverdue(tasks: ITask[]): Suggestion | null {
        // Filter overdue items
        const overdueTasks = tasks.filter(t => t.status === "overdue");

        if (overdueTasks.length === 0) return null;

        // Sort by Priority (High > Medium > Low) then DueDate (Oldest first)
        const priorityMap = { "High": 3, "Medium": 2, "Low": 1, undefined: 0 };

        overdueTasks.sort((a, b) => {
            const pA = priorityMap[a.priority as keyof typeof priorityMap] || 0;
            const pB = priorityMap[b.priority as keyof typeof priorityMap] || 0;
            if (pA !== pB) return pB - pA; // Higher priority first

            // If priority same, check due date (older first)
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            return dateA - dateB;
        });

        return {
            task: overdueTasks[0],
            reason: "This task is overdue. Let's get it done."
        };
    }

    private static checkHighPriorityToday(tasks: ITask[]): Suggestion | null {
        const todayHigh = tasks.find(t => t.status === "today" && t.priority === "High");
        if (todayHigh) {
            return {
                task: todayHigh,
                reason: "High priority task for today."
            };
        }
        return null;
    }

    private static checkStreakProtection(tasks: ITask[]): Suggestion | null {
        // Suggest a quick win (Low/Medium priority) if available
        const quickWin = tasks.find(t => (t.status === "today" || !t.status) && (t.priority === "Low" || t.priority === "Medium"));
        if (quickWin) {
            return {
                task: quickWin,
                reason: "Quick win to build momentum."
            };
        }
        return null;
    }

    private static checkOldestPending(tasks: ITask[]): Suggestion | null {
        // If we have tasks that are just sitting there (not overdue, but maybe 'today' or no status)
        // Sort by createdAt if available (mongoose timestamps)
        // Casting to any because createdAt is on Document but sometimes not in interface unless added
        const sorted = [...tasks].sort((a: any, b: any) => {
            const dA = new Date(a.createdAt || 0).getTime();
            const dB = new Date(b.createdAt || 0).getTime();
            return dA - dB; // Oldest first
        });

        const oldest = sorted[0];
        if (oldest) {
            return {
                task: oldest,
                reason: "This has been on your list for a while."
            };
        }
        return null;
    }

    // --- AI Fallback ---

    private static async aiEvaluate(tasks: ITask[]): Promise<Suggestion | null> {
        if (tasks.length === 0) return null;

        // Limit context window
        const candidates = tasks.slice(0, 10).map(t => ({
            id: (t as any)._id,
            title: t.title,
            priority: t.priority,
            dueDate: t.dueDate,
            desc: t.description
        }));

        const prompt = `
        Select the SINGLE best task for the user to focus on right now from this list:
        ${JSON.stringify(candidates)}

        Analyze based on cognitive load, priority, and urgency.
        Return JSON ONLY: { "taskId": "id_here", "reason": "short 1 sentence reason" }
    `;

        // 1. Try Gemini
        const geminiKey = process.env.GEMINI_API_KEY;
        if (geminiKey) {
            try {
                const genAI = new GoogleGenerativeAI(geminiKey);
                const model = genAI.getGenerativeModel({
                    model: "gemini-1.5-flash", // Using Flash as per plan for speed/cost
                    generationConfig: { responseMimeType: "application/json" }
                });
                const result = await model.generateContent(prompt);
                const text = result.response.text();

                const parsed = JSON.parse(text);
                const validated = AiSuggestionSchema.safeParse(parsed);

                if (validated.success) {
                    const selected = tasks.find(t => (t as any)._id.toString() === validated.data.taskId);
                    if (selected) {
                        return {
                            task: selected,
                            reason: validated.data.reason
                        };
                    }
                }
            } catch (e) {
                console.error("Gemini Suggestion Error", e);
            }
        }

        // 2. Try Groq (Backup)
        const groqKey = process.env.GROQ_API_KEY;
        if (groqKey) {
            try {
                const groq = new Groq({ apiKey: groqKey });
                const completion = await groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt + " Respond in JSON." }],
                    model: "llama-3.1-8b-instant",
                    response_format: { type: "json_object" }
                });
                const content = completion.choices[0]?.message?.content || "{}";
                const parsed = JSON.parse(content);
                const validated = AiSuggestionSchema.safeParse(parsed);

                if (validated.success) {
                    const selected = tasks.find(t => (t as any)._id.toString() === validated.data.taskId);
                    if (selected) {
                        return {
                            task: selected,
                            reason: validated.data.reason
                        };
                    }
                }
            } catch (e) {
                console.error("Groq Suggestion Error", e);
            }
        }

        return null;
    }
}
