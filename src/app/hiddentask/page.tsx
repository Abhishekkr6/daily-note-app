"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

const INTERVIEW_QUESTIONS = `# 📝 Daily Note App - Interview Questions

[Content will be loaded from file]
`;

const TODO_TASKS = `# ✅ Daily Note App - TODO Tasks

[Content will be loaded from file]
`;

const WALKTHROUGH = `# 📚 Interview Preparation Walkthrough

[Content will be loaded from file]
`;

export default function HiddenTaskPage() {
    const [activeTab, setActiveTab] = useState("questions");

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">🔒 Interview Preparation</h1>
                    <p className="text-muted-foreground">Hidden documentation for interview prep</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="questions">Interview Questions</TabsTrigger>
                        <TabsTrigger value="tasks">TODO Tasks</TabsTrigger>
                        <TabsTrigger value="walkthrough">Walkthrough</TabsTrigger>
                    </TabsList>

                    <TabsContent value="questions" className="mt-6">
                        <Card className="p-6">
                            <div className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown>{INTERVIEW_QUESTIONS}</ReactMarkdown>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="tasks" className="mt-6">
                        <Card className="p-6">
                            <div className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown>{TODO_TASKS}</ReactMarkdown>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="walkthrough" className="mt-6">
                        <Card className="p-6">
                            <div className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown>{WALKTHROUGH}</ReactMarkdown>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
