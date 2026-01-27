"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SmartSuggestionProps {
    onFocusTask: (taskId: string) => void;
    className?: string;
}

type Suggestion = {
    task: {
        _id: string;
        title: string;
        priority?: string;
        status?: string;
    };
    reason: string;
};

export function SmartSuggestion({ onFocusTask, className }: SmartSuggestionProps) {
    const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const fetchSuggestion = async () => {
            try {
                setLoading(true);
                // Default: allowAi = false (Strict Rule-Based only on load)
                const res = await fetch("/api/tasks/suggest", {
                    method: "POST",
                    body: JSON.stringify({ allowAi: false }),
                    headers: { "Content-Type": "application/json" }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.suggestion) {
                        setSuggestion(data.suggestion);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch suggestion", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestion();
    }, []);

    if (!visible || !suggestion) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={className}
            >
                <Card className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-100 dark:border-indigo-900 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2">
                        <button
                            onClick={() => setVisible(false)}
                            className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>

                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                    Suggested Task
                                </span>
                                {suggestion.task.priority && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${suggestion.task.priority === 'High'
                                            ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'
                                            : 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                        }`}>
                                        {suggestion.task.priority}
                                    </span>
                                )}
                            </div>
                            <h3 className="font-medium text-foreground text-sm sm:text-base line-clamp-1">
                                {suggestion.task.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                "{suggestion.reason}"
                            </p>
                        </div>

                        <Button
                            size="sm"
                            onClick={() => onFocusTask(suggestion.task._id)}
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200/50 dark:shadow-none flex-shrink-0"
                        >
                            Start Focus <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}
