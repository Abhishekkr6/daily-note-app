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

interface DailyReflectionProps {
    hasCompletedTasks: boolean;
}

export function DailyReflection({ hasCompletedTasks }: DailyReflectionProps) {
    const [data, setData] = useState<ReflectionData | null>(null);
    const [loading, setLoading] = useState(false);
    const [generated, setGenerated] = useState(false);

    // Check if reflection already exists for today on mount
    useEffect(() => {
        const checkExisting = async () => {
            try {
                // Check logic...
            } catch (e) {
                console.error(e);
            }
        };
        // We only check if we might show previously generated data
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
            <Card className="bg-card border-border shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Sparkles className="w-24 h-24 text-muted-foreground/20" />
                </div>
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4 relative z-10">
                    <div className="p-3 bg-muted/50 rounded-full shadow-sm ring-1 ring-border">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Daily Reflection</h3>
                        <p className="text-sm text-muted-foreground mt-1 px-4">
                            Gain AI-powered insights from your completed tasks and focus sessions.
                        </p>
                    </div>
                    <Button
                        onClick={handleGenerate}
                        disabled={loading || !hasCompletedTasks}
                        variant="default"
                        className={`w-full sm:w-auto shadow-sm ${!hasCompletedTasks ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                        title={!hasCompletedTasks ? "Complete at least one task to generate insights" : "Generate Daily Reflection"}
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                {hasCompletedTasks ? "Generate Insights" : "Complete a task first"}
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card border-border shadow-sm overflow-hidden relative">
            <CardHeader className="pb-2 border-b border-border bg-muted/10">
                <CardTitle className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3 text-base sm:text-lg">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary shrink-0" />
                        <span className="whitespace-nowrap">Daily Reflection</span>
                    </div>
                    {data?.date && (
                        <span className="text-[10px] sm:text-xs font-normal text-muted-foreground border border-border px-2 py-0.5 rounded-full whitespace-nowrap">
                            {data.date}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-5">

                {/* Wins */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-green-500">
                        <Trophy className="w-4 h-4 shrink-0" />
                        <span>Today's Wins</span>
                    </div>
                    <ul className="space-y-1.5">
                        {data?.wins.length === 0 && <li className="text-sm text-muted-foreground italic">No completed tasks yet. Keep going!</li>}
                        {data?.wins?.map((win, i) => (
                            <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground leading-snug">
                                <span className="text-green-500 mt-1 shrink-0">•</span>
                                <span className="break-words">{win}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Pending */}
                {data?.pending && data.pending.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-orange-500">
                            <Calendar className="w-4 h-4 shrink-0" />
                            <span>Focus For Tomorrow</span>
                        </div>
                        <ul className="space-y-1.5">
                            {data.pending.map((item, i) => (
                                <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground leading-snug">
                                    <span className="text-orange-500 mt-1 shrink-0">•</span>
                                    <span className="break-words">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Suggestion */}
                {data?.suggestion && (
                    <div className="bg-muted/30 p-3 rounded-lg border border-border flex gap-3 items-start">
                        <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground italic leading-relaxed break-words">
                            "{data.suggestion}"
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
