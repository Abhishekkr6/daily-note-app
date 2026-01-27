"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, Calendar, Lightbulb } from "lucide-react";
import { toast } from "sonner";

type ReflectionData = {
    wins: string[];
    pending: string[];
    suggestion: string;
    date: string;
};

export function DailyReflection() {
    const [data, setData] = useState<ReflectionData | null>(null);
    const [loading, setLoading] = useState(false);
    const [generated, setGenerated] = useState(false);

    // Check if reflection already exists for today on mount
    useEffect(() => {
        const checkExisting = async () => {
            try {
                const today = new Date().toISOString().slice(0, 10);
                // We can just try to fetch. If it exists, the API returns it. 
                // If it doesn't exist, the API generates it.
                // To avoid auto-generating on load (saving costs), we might want a specific check or just let the user click "Generate".
                // HOWEVER, the requirement was "Generate ... based on completed tasks... Limit to ONCE per day".
                // A common pattern is: User clicks "Reflect on Day" -> API calls.
                // If we want to show it automatically if it already exists, we need a way to know without triggering generation.
                // For now, we'll assume the user triggers it manually, OR we fetch and if it returns a cached one, we show it. 
                // But the API route logic I wrote *always* generates if not found. 
                // That's fine for "ONCE per day" if we assume the user visits the dashboard to see it.
                // Let's stick to a "Generate Reflection" button for the first time to make it feel special/intentional.

                // Actually, to know if we should show the button or the result, we'd need to know if it exists.
                // Let's try to fetch. If valid data comes back, we show it.
                // Optimization: The current API will generate if missing. 
                // Let's refine the UI: Show "Generate Daily Reflection" button. 
                // If the user has already generated it, clicking it will just return the cached version fast.
            } catch (e) {
                console.error(e);
            }
        };
        checkExisting();
    }, []);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/ai/daily-reflection");
            if (!res.ok) throw new Error("Failed to generate reflection");
            const result = await res.json();
            setData(result);
            setGenerated(true);
            toast.success("Daily Reflection Generated!");
        } catch (error) {
            console.error(error);
            toast.error("Could not generate reflection. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    if (!generated && !data) {
        return (
            <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/10 dark:to-purple-950/10 border-indigo-100 dark:border-indigo-900/20 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5">
                    <Sparkles className="w-24 h-24 text-indigo-500" />
                </div>
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4 relative z-10">
                    <div className="p-3 bg-white dark:bg-card/50 rounded-full shadow-sm ring-1 ring-indigo-50 dark:ring-indigo-900/30">
                        <Sparkles className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Daily Reflection</h3>
                        <p className="text-sm text-muted-foreground mt-1 px-4">
                            Gain AI-powered insights from your completed tasks and focus sessions.
                        </p>
                    </div>
                    <Button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-md transition-all hover:scale-105 active:scale-95"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate Insights
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-gradient-to-br from-card to-muted/30 border-border shadow-sm overflow-hidden relative">
            <CardHeader className="pb-2 border-b border-border/50 bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                    <span>Daily Reflection</span>
                    {data?.date && <span className="text-xs font-normal text-muted-foreground ml-auto border border-border px-2 py-0.5 rounded-full">{data.date}</span>}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-5">

                {/* Wins */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                        <Trophy className="w-4 h-4" />
                        <span>Today's Wins</span>
                    </div>
                    <ul className="space-y-1">
                        {data?.wins.length === 0 && <li className="text-sm text-muted-foreground italic">No completed tasks yet. Keep going!</li>}
                        {data?.wins?.map((win, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-green-500 dark:text-green-400 mt-1">•</span>
                                <span className="text-foreground/90">{win}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Pending */}
                {data?.pending && data.pending.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400">
                            <Calendar className="w-4 h-4" />
                            <span>Focus For Tomorrow</span>
                        </div>
                        <ul className="space-y-1">
                            {data.pending.map((item, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                    <span className="text-orange-400 dark:text-orange-300 mt-1">•</span>
                                    <span className="text-foreground/90">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Suggestion */}
                {data?.suggestion && (
                    <div className="bg-indigo-50 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50 flex gap-3 items-start">
                        <Lightbulb className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-indigo-900 dark:text-indigo-200 italic leading-relaxed">
                            "{data.suggestion}"
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
