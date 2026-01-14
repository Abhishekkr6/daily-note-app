"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Loader2, FileText, CheckSquare, BookOpen } from "lucide-react";

export default function HiddenTaskPage() {
    const [activeTab, setActiveTab] = useState("questions");
    const [questions, setQuestions] = useState("");
    const [tasks, setTasks] = useState("");
    const [walkthrough, setWalkthrough] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const [questionsRes, tasksRes, walkthroughRes] = await Promise.all([
                    fetch("/interview-questions.md"),
                    fetch("/todo-tasks.md"),
                    fetch("/walkthrough.md"),
                ]);

                const [questionsText, tasksText, walkthroughText] = await Promise.all([
                    questionsRes.text(),
                    tasksRes.text(),
                    walkthroughRes.text(),
                ]);

                setQuestions(questionsText);
                setTasks(tasksText);
                setWalkthrough(walkthroughText);
            } catch (error) {
                console.error("Error loading documents:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDocs();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Loading interview prep materials...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header - Mobile optimized */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🔒</span>
                        <h1 className="text-xl md:text-3xl font-bold">Interview Preparation</h1>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">
                        Hidden documentation for interview prep
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    {/* Mobile-first tabs */}
                    <TabsList className="grid w-full grid-cols-3 h-auto">
                        <TabsTrigger
                            value="questions"
                            className="flex flex-col gap-1 py-2 text-xs md:text-sm"
                        >
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">Interview Questions</span>
                            <span className="sm:hidden">Questions</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="tasks"
                            className="flex flex-col gap-1 py-2 text-xs md:text-sm"
                        >
                            <CheckSquare className="h-4 w-4" />
                            <span className="hidden sm:inline">TODO Tasks</span>
                            <span className="sm:hidden">Tasks</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="walkthrough"
                            className="flex flex-col gap-1 py-2 text-xs md:text-sm"
                        >
                            <BookOpen className="h-4 w-4" />
                            <span>Walkthrough</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Questions Tab */}
                    <TabsContent value="questions" className="mt-4 md:mt-6">
                        <Card className="p-3 md:p-6">
                            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none overflow-x-auto">
                                <pre className="whitespace-pre-wrap break-words text-xs md:text-sm">
                                    {questions}
                                </pre>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Tasks Tab */}
                    <TabsContent value="tasks" className="mt-4 md:mt-6">
                        <Card className="p-3 md:p-6">
                            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none overflow-x-auto">
                                <pre className="whitespace-pre-wrap break-words text-xs md:text-sm">
                                    {tasks}
                                </pre>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Walkthrough Tab */}
                    <TabsContent value="walkthrough" className="mt-4 md:mt-6">
                        <Card className="p-3 md:p-6">
                            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none overflow-x-auto">
                                <pre className="whitespace-pre-wrap break-words text-xs md:text-sm">
                                    {walkthrough}
                                </pre>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
