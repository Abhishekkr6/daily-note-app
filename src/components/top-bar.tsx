"use client";

import { Search, Moon, Sun, User, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { MobileNav } from "@/components/mobile-nav";

export function TopBar() {
  const router = useRouter();
  // User profile fetch logic — prefer NextAuth session when available to avoid race
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<{ name: string; email: string; avatarUrl: string | null }>({ name: "", email: "", avatarUrl: null });
  const [avatarLoading, setAvatarLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      setAvatarLoading(true);
      try {
        // If session present, use it immediately
        if (session && session.user) {
          if (!mounted) return;
          setProfile({
            name: (session.user.name as string) || "",
            email: (session.user.email as string) || "",
            avatarUrl: (session.user.image as string) || null,
          });
          setAvatarLoading(false);
          return;
        }

        // Wait until next-auth finished loading before hitting protected API
        if (status === "loading") return;

        const res = await fetch("/api/users/profile", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (!mounted) return;
          setProfile({
            name: data.name || "",
            email: data.email || "",
            avatarUrl: data.avatarUrl || null,
          });
        }
      } catch { }
      setAvatarLoading(false);
    }
    fetchProfile();
    // Listen for avatarUrl changes from settings page
    const handler = (e: any) => {
      setProfile((prev) => ({ ...prev, avatarUrl: e.detail.avatarUrl }));
    };
    window.addEventListener("avatarUrlChanged", handler);
    return () => {
      mounted = false;
      window.removeEventListener("avatarUrlChanged", handler);
    };
  }, [session, status]);

  // Debug: log session and resolved profile to help trace missing avatar issues
  useEffect(() => {
    try {
      console.debug("TopBar session:", session);
      console.debug("TopBar profile:", profile);
    } catch (e) {
      // ignore
    }
  }, [session, profile]);
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  type Item = {
    id: number;
    type: string;
    title: string;
    content: string;
    createdAt: string;
    status: string;
  };

  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch all user tasks for search
  const [allTasks, setAllTasks] = useState<Item[]>([]);
  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("/api/tasks");
        if (!res.ok) return;
        const data = await res.json();
        // Normalize to Item type (if needed)
        const mapped = data.map((t: any) => ({
          id: t._id || t.id,
          type: "task",
          title: t.title || "",
          content: t.description || t.content || "",
          createdAt: t.createdAt || "",
          status: t.status || "",
        }));
        setAllTasks(mapped);
      } catch { }
    }
    fetchTasks();
  }, []);

  // Real streak logic: fetch activity and calculate streak like StatsPage
  const [streak, setStreak] = useState<number | null>(null);
  const [lastStreak, setLastStreak] = useState<number>(0);
  // Streak fetcher function
  const fetchStreak = async () => {
    try {
      const res = await fetch("/api/activity");
      if (!res.ok) return;
      let activity = await res.json();
      // Sort activity by date descending (latest first)
      activity = activity.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      let streak = 0;
      let lastStreak = 0;
      const todayStr = new Date().toISOString().slice(0, 10);
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      // Calculate streak from today
      let started = false;
      for (let i = 0; i < activity.length; i++) {
        if (!started) {
          if (activity[i].date === todayStr && activity[i].completed > 0) {
            started = true;
            streak = 1;
          }
        } else {
          if (activity[i].completed > 0) {
            streak++;
          } else {
            break;
          }
        }
      }
      // Calculate last streak (ending yesterday)
      let lastStarted = false;
      for (let i = 0; i < activity.length; i++) {
        if (!lastStarted) {
          if (activity[i].date === yesterdayStr && activity[i].completed > 0) {
            lastStarted = true;
            lastStreak = 1;
          }
        } else {
          if (activity[i].completed > 0) {
            lastStreak++;
          } else {
            break;
          }
        }
      }
      setLastStreak(lastStreak);
      // If today is completed, show current streak, else show last streak (if yesterday was completed), else 0
      if (activity[0]?.date === todayStr && activity[0]?.completed > 0) {
        setStreak(streak);
      } else if (activity[0]?.date === todayStr && activity[0]?.completed === 0 && lastStreak > 0) {
        setStreak(0); // If today missed, show 0
      } else {
        setStreak(0);
      }
    } catch { }
  };

  useEffect(() => {
    fetchStreak();
    // Listen for activityChanged event for realtime streak update
    const handler = () => fetchStreak();
    window.addEventListener('activityChanged', handler);
    return () => window.removeEventListener('activityChanged', handler);
  }, []);

  // ...existing code...

  // Debounced search handler
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (!searchQuery) {
      setResults([]);
      setShowDropdown(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceTimeout.current = setTimeout(() => {
      const filtered = allTasks.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
      setShowDropdown(true);
      setLoading(false);
    }, 350);
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchQuery, allTasks]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains((e.target as Node))) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Modern Clock Component
  const [clockTime, setClockTime] = useState<string>("");
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClockTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-background border-b border-border">
      {/* Left section - Date */}
      <div className="flex items-center space-x-4">
        <MobileNav />
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {currentDate}
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back to your daily workspace
          </p>
        </div>
      </div>

      {/* Center section - Search + Clock */}
      <div className="flex items-center flex-1 max-w-xl mx-8 gap-8">
        <div className="flex-1" ref={inputRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes and tasks..."
              className="pl-10 bg-muted/50 border-border focus:bg-background transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowDropdown(true)}
              autoComplete="off"
            />
            {showDropdown && (
              <div className="absolute left-0 right-0 mt-2 bg-background border border-border rounded shadow-lg z-10 max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Searching...
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No results found
                  </div>
                ) : (
                  <ul>
                    {results.map((item) => (
                      <li
                        key={item.id}
                        className="px-4 py-2 hover:bg-muted cursor-pointer flex flex-col border-b last:border-b-0"
                        onClick={() => router.push(`/tasks?highlight=${item.id}`)}
                      >
                        <span className="font-medium text-foreground">
                          {item.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.type === "note" ? "Note" : "Task"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {item.content}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Modern Clock (extra small) */}
        <div className="flex items-center justify-center min-w-[60px] px-1 py-0.5 rounded bg-muted/60 border border-border shadow text-xs font-mono text-primary select-none">
          {clockTime}
        </div>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center space-x-4">
        {/* Streak Counter */}
        <Badge
          variant="secondary"
          className="flex items-center space-x-1 px-3 py-1"
        >
          <Flame className="w-3 h-3 text-primary" />
          <span className="text-sm font-medium">
            {streak !== null && streak > 0
              ? streak
              : lastStreak > 0
                ? lastStreak
                : 0} day streak
          </span>
        </Badge>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-muted-foreground hover:text-foreground"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Profile Avatar */}
        <Avatar className="w-8 h-8 border-2 border-border shadow-sm bg-background">
          {avatarLoading ? (
            <div className="animate-pulse w-full h-full bg-muted rounded-full" />
          ) : profile.avatarUrl ? (
            <AvatarImage src={profile.avatarUrl} alt="Profile" className="object-cover w-full h-full rounded-full" />
          ) : (
            <AvatarFallback className="bg-primary text-primary-foreground text-xl flex items-center justify-center w-full h-full rounded-full">
              {profile.name
                ? profile.name[0].toUpperCase()
                : profile.email
                  ? profile.email[0].toUpperCase()
                  : ""}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
    </header>
  );
}
