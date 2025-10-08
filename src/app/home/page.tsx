"use client";

export const dynamic = "force-dynamic";

import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { TodayDashboard } from "@/components/today-dashboard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Debug: log session and status
    console.log('Session:', session);
    console.log('Session status:', status);
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router, session]);

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>No session found. Check console for details.</div>;

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
