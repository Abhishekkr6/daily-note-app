
"use client";

import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { TodayDashboard } from "@/components/today-dashboard";
import { WelcomeToast } from "@/components/welcome-toast";
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
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/users/aboutme", { method: "POST" });
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
  }, [router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto">
          <TodayDashboard />
        </main>
      </div>
      {/* Welcome Toast Animation */}
  <WelcomeToast name={user?.username || user?.name || "User"} />
    </div>
  );
}
