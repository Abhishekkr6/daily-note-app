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

    const renderMarkdown = (content: string) => {
        return content.split('\n').map((line, index) => {
            // Headers
            if (line.startsWith('# ')) {
                return <h1 key={index} className="text-2xl md:text-4xl font-bold mt-6 mb-4">{line.substring(2)}</h1>;
            }
            if (line.startsWith('## ')) {
                return <h2 key={index} className="text-xl md:text-3xl font-bold mt-5 mb-3">{line.substring(3)}</h2>;
            }
            if (line.startsWith('### ')) {
                return <h3 key={index} className="text-lg md:text-2xl font-semibold mt-4 mb-2">{line.substring(4)}</h3>;
            }
            if (line.startsWith('#### ')) {
                return <h4 key={index} className="text-base md:text-xl font-semibold mt-3 mb-2">{line.substring(5)}</h4>;
            }

            // Code blocks
            if (line.startsWith('```')) {
                return <div key={index} className="my-2 text-xs md:text-sm font-mono bg-muted p-2 rounded">{line}</div>;
            }

            // Lists
            if (line.startsWith('- ')) {
                return <li key={index} className="ml-4 text-sm md:text-base">{line.substring(2)}</li>;
            }
            if (line.match(/^\d+\. /)) {
                return <li key={index} className="ml-4 text-sm md:text-base list-decimal">{line.substring(line.indexOf('. ') + 2)}</li>;
            }

            // Checkboxes
            if (line.includes('- [ ]')) {
                return <div key={index} className="flex items-start gap-2 text-sm md:text-base"><input type="checkbox" disabled /> {line.replace('- [ ]', '')}</div>;
            }
            if (line.includes('- [x]') || line.includes('- [X]')) {
                return <div key={index} className="flex items-start gap-2 text-sm md:text-base"><input type="checkbox" checked disabled /> {line.replace(/- \[x\]/i, '')}</div>;
            }

            // Bold
            const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            // Empty lines
            if (line.trim() === '') {
                return <br key={index} />;
            }

            // Regular paragraph
            return <p key={index} className="text-sm md:text-base mb-2" dangerouslySetInnerHTML={{ __html: boldText }} />;
        });
    };

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
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
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
                    <TabsList className="grid w-full grid-cols-3 h-auto">
                        <TabsTrigger value="questions" className="flex flex-col gap-1 py-2 text-xs md:text-sm">
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">Questions</span>
                            <span className="sm:hidden text-[10px]">Q&A</span>
                        </TabsTrigger>
                        <TabsTrigger value="tasks" className="flex flex-col gap-1 py-2 text-xs md:text-sm">
                            <CheckSquare className="h-4 w-4" />
                            <span>Tasks</span>
                        </TabsTrigger>
                        <TabsTrigger value="walkthrough" className="flex flex-col gap-1 py-2 text-xs md:text-sm">
                            <BookOpen className="h-4 w-4" />
                            <span className="hidden sm:inline">Walkthrough</span>
                            <span className="sm:hidden text-[10px]">Guide</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="questions" className="mt-4 md:mt-6">
                        <Card className="p-3 md:p-6 overflow-x-auto">
                            <div className="space-y-2">
                                {renderMarkdown(questions)}
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="tasks" className="mt-4 md:mt-6">
                        <Card className="p-3 md:p-6 overflow-x-auto">
                            <div className="space-y-2">
                                {renderMarkdown(tasks)}
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="walkthrough" className="mt-4 md:mt-6">
                        <Card className="p-3 md:p-6 overflow-x-auto">
                            <div className="space-y-2">
                                {renderMarkdown(walkthrough)}
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
