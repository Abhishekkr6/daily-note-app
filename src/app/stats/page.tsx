"use client";


import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { StatsPage } from "@/components/stats-page";
import { AppSkeleton } from "@/components/AppSkeleton";
import { useState, useEffect } from "react";

export default function Stats() {
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
          <StatsPage />
        </main>
      </div>
    </div>
  );
}
