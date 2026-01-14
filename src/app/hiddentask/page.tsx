"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";

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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading interview prep materials...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">🔒 Interview Preparation</h1>
                    <p className="text-muted-foreground">Hidden documentation for interview prep</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="questions">Interview Questions</TabsTrigger>
                        <TabsTrigger value="tasks">TODO Tasks</TabsTrigger>
                        <TabsTrigger value="walkthrough">Walkthrough</TabsTrigger>
                    </TabsList>

                    <TabsContent value="questions" className="mt-6">
                        <Card className="p-4 md:p-6">
                            <div className="prose dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:text-foreground">
                                <ReactMarkdown>{questions}</ReactMarkdown>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="tasks" className="mt-6">
                        <Card className="p-4 md:p-6">
                            <div className="prose dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:text-foreground">
                                <ReactMarkdown>{tasks}</ReactMarkdown>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="walkthrough" className="mt-6">
                        <Card className="p-4 md:p-6">
                            <div className="prose dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:text-foreground">
                                <ReactMarkdown>{walkthrough}</ReactMarkdown>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
