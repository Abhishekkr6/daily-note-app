import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { TodayDashboard } from "@/components/today-dashboard";

export default function Landing() {
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
          <TodayDashboard />
        </main>
      </div>
    </div>
  );
}
