
"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { CalendarPage } from "@/components/calendar-page";

export default function Calendar() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <CalendarPage />
        </main>
      </div>
    </div>
  );
}
