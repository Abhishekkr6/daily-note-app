"use client";

import { Search, Moon, Sun, User, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import React, { useState, useRef, useEffect } from "react";

export function TopBar() {
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

  // Mock local data (replace with actual notes/tasks)
  // Add createdAt and status for streak logic
  const localData = [
    {
      id: 1,
      type: "note",
      title: "Meeting notes",
      content: "Discuss project timeline",
      createdAt: "2025-09-10",
      status: "completed",
    },
    {
      id: 2,
      type: "task",
      title: "Buy groceries",
      content: "Milk, eggs, bread",
      createdAt: "2025-09-10",
      status: "completed",
    },
    {
      id: 3,
      type: "note",
      title: "React tips",
      content: "Use hooks for state",
      createdAt: "2025-09-09",
      status: "completed",
    },
    {
      id: 4,
      type: "task",
      title: "Finish report",
      content: "Due by Friday",
      createdAt: "2025-09-08",
      status: "completed",
    },
    {
      id: 5,
      type: "note",
      title: "Daily reflection",
      content: "What went well today?",
      createdAt: "2025-09-07",
      status: "completed",
    },
    {
      id: 6,
      type: "task",
      title: "Read chapter 5",
      content: "Continue reading 'Atomic Habits'",
      createdAt: "2025-09-06",
      status: "completed",
    },
    {
      id: 7,
      type: "task",
      title: "Morning workout",
      content: "Exercise routine",
      createdAt: "2025-09-05",
      status: "completed",
    },
  ];

  // Streak counter logic
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Get all completed items with createdAt
    const completed = localData.filter(
      (item) => item.status === "completed" && item.createdAt
    );
    // Get unique days with completed items
    const days = Array.from(
      new Set(completed.map((item) => item.createdAt))
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    // Calculate streak: how many consecutive days from today backwards have completed items
    let currentStreak = 0;
    let date = new Date();
    for (let i = 0; i < days.length; i++) {
      const streakDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - i
      );
      const streakDateStr = streakDate.toISOString().slice(0, 10);
      if (days.includes(streakDateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }
    setStreak(currentStreak);
  }, [localData]);

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
      const filtered = localData.filter(
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
  }, [searchQuery]);

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

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-background border-b border-border">
      {/* Left section - Date */}
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {currentDate}
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back to your daily workspace
          </p>
        </div>
      </div>

      {/* Center section - Search */}
      <div className="flex-1 max-w-md mx-8" ref={inputRef}>
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
            <div className="absolute left-0 right-0 mt-2 bg-background border border-border rounded shadow-lg z-10">
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

      {/* Right section - Actions */}
      <div className="flex items-center space-x-4">
        {/* Streak Counter */}
        <Badge
          variant="secondary"
          className="flex items-center space-x-1 px-3 py-1"
        >
          <Flame className="w-3 h-3 text-primary" />
          <span className="text-sm font-medium">{streak} day streak</span>
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
        <Avatar className="w-8 h-8">
          <AvatarImage src="/diverse-user-avatars.png" alt="Profile" />
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
