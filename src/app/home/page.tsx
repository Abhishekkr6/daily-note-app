
"use client";

import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { TodayDashboard } from "@/components/today-dashboard";
import { WelcomeToast } from "@/components/welcome-toast";
import LeaderboardToast from "@/components/leaderboard-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type UserType = {
  username?: string;
  name?: string;
  email?: string;
  [key: string]: any;
};

export default function HomePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLeaderboardToast, setShowLeaderboardToast] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/users/aboutme", { method: "POST", credentials: "include" });
        const data = await res.json();
        if (data?.data) {
          setUser(data.data);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();

    // Check for login flag in sessionStorage
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("justLoggedIn") === "true") {
        setShowWelcome(true);
        sessionStorage.removeItem("justLoggedIn");
      }

      // Show leaderboard one-time toast if not seen
      try {
        const seen = !!localStorage.getItem('leaderboard_toast_seen_v1');
        if (!seen) setShowLeaderboardToast(true);
      } catch (e) {
        // ignore
      }
    }
  }, [router]);


  if (loading) {
    return (
      <div className="flex min-h-screen bg-background animate-pulse">
        <div className="w-64 bg-muted/30 border-r border-border" />
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-muted/30 border-b border-border" />
          <main className="flex-1 p-6">
            <div className="h-96 bg-muted/20 rounded-xl" />
          </main>
        </div>
      </div>
    );
  }
  if (!user) return null;

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
          <TodayDashboard />
        </main>
      </div>
      {/* Welcome Toast Animation */}
      {showWelcome && (
        <WelcomeToast name={user?.username || user?.name || "User"} />
      )}
      {/* Leaderboard one-time toast */}
      {showLeaderboardToast && <LeaderboardToast />}
    </div>
  );
}
