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
    <div className="flex min-h-screen bg-background">
      <div className="h-screen flex flex-col sticky top-0">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-10">
          <TopBar />
        </div>
        <main className="flex-1 overflow-y-auto">
          <CalendarPage />
        </main>
      </div>
    </div>
  );
}
