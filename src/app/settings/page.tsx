"use client";

import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { SettingsPage } from "@/components/settings-page";

export default function Settings() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="h-screen flex flex-col sticky top-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="sticky top-0 z-10">
          <TopBar />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <SettingsPage />
        </main>
      </div>
    </div>
  );
}
