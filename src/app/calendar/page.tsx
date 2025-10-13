"use client";


import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { CalendarPage } from "@/components/calendar-page";
import { AppSkeleton } from "@/components/AppSkeleton";
import { useState, useEffect } from "react";

export default function Calendar() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <AppSkeleton />;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto">
          <CalendarPage />
        </main>
      </div>
    </div>
  );
}
