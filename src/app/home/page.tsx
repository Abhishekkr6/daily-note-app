
"use client";

import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { TodayDashboard } from "@/components/today-dashboard";
import { WelcomeToast } from "@/components/welcome-toast";
import LeaderboardToast from "@/components/leaderboard-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

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

  const { data: session, status } = useSession();

  useEffect(() => {
    let leaderboardTimer: ReturnType<typeof setTimeout> | null = null;
    const justLoggedIn = typeof window !== 'undefined' && sessionStorage.getItem('justLoggedIn') === 'true';
    if (justLoggedIn) {
      setShowWelcome(true);
      try { sessionStorage.removeItem('justLoggedIn'); } catch (e) { }
    }

    async function fetchUser() {
      try {
        // Wait for NextAuth to finish loading session to avoid a race where
        // the client asks the API before the auth cookie is set on redirect.
        if (status === "loading") return;
        // Prefer loading the server-side user record so we can read server
        // preferences (like preferences.leaderboardSeen) even when NextAuth
        // session is available. This ensures new-user announcements are shown.
        const res = await fetch("/api/users/aboutme", { method: "POST", credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data?.data) {
            setUser(data.data);
            // Decide leaderboard toast visibility based on server preference + local storage
            try {
              const localSeen = !!localStorage.getItem('leaderboard_toast_seen_v1');
              const serverSeen = !!data.data?.preferences?.leaderboardSeen;
              if (!localSeen && !serverSeen) {
                if (justLoggedIn) {
                  // Delay slightly longer than welcome toast (5500ms) so leaderboard appears after welcome
                  leaderboardTimer = setTimeout(() => setShowLeaderboardToast(true), 6000);
                } else {
                  setShowLeaderboardToast(true);
                }
              }
            } catch (e) {
              // If storage access fails, still show toast for new users
              const serverSeen = !!data.data?.preferences?.leaderboardSeen;
              if (!serverSeen) {
                if (justLoggedIn) {
                  leaderboardTimer = setTimeout(() => setShowLeaderboardToast(true), 6000);
                } else {
                  setShowLeaderboardToast(true);
                }
              }
            }
            // Also ensure welcome flag handling below still runs
          } else {
            // If server didn't return user but session exists, fall back to session
            if (session && session.user) {
              setUser({
                ...session.user,
                username: session.user.name ?? session.user.email?.split("@")[0],
                name: session.user.name ?? undefined,
                email: session.user.email ?? undefined,
              });
            } else {
              router.push("/login");
            }
          }
        } else {
          // If aboutme fails, fall back to session if available
          if (session && session.user) {
            setUser({
              ...session.user,
              username: session.user.name ?? session.user.email?.split("@")[0],
              name: session.user.name ?? undefined,
              email: session.user.email ?? undefined,
            });
          } else {
            router.push("/login");
          }
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();

    // If fetchUser didn't already schedule the leaderboard (aboutme failed),
    // and the user just logged in, ensure we still show leaderboard after welcome.
    if (typeof window !== "undefined" && justLoggedIn) {
      if (!showLeaderboardToast) {
        leaderboardTimer = setTimeout(() => setShowLeaderboardToast(true), 6000);
      }
    }

    return () => {
      if (leaderboardTimer) clearTimeout(leaderboardTimer);
    };
  }, [router, session, status]);


  if (loading) {
    return (
      <div className="flex min-h-screen bg-background animate-pulse flex-col md:flex-row">
        <div className="hidden md:block w-64 bg-muted/30 border-r border-border" />
        <div className="flex-1 flex flex-col w-full">
          <div className="h-16 bg-muted/30 border-b border-border" />
          <main className="flex-1 p-4 md:p-6">
            <div className="h-96 bg-muted/20 rounded-xl" />
          </main>
        </div>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row w-full overflow-x-hidden">
      <div className="h-screen flex-col sticky top-0 hidden md:flex">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col w-full min-w-0">
        <div className="sticky top-0 z-10">
          <TopBar />
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
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
