"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover"
import { Calendar, CheckSquare, BarChart3, FileText, Settings, Home, ChevronLeft, ChevronRight, Trophy } from "lucide-react"

interface SidebarProps {
  className?: string
}

const navigation = [
  { name: "Today", href: "/home", icon: Home },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "All Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Stats", href: "/stats", icon: BarChart3 },
  { name: "Templates", href: "/templates", icon: FileText },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [leaderboardSeen, setLeaderboardSeen] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') return !!localStorage.getItem('leaderboard_toast_seen_v1');
    } catch (e) {
      return false;
    }
    return false;
  });

  // Mark leaderboard as seen (persistently) when user clicks the nav item
  function markLeaderboardSeen() {
    try {
      localStorage.setItem('leaderboard_toast_seen_v1', '1');
    } catch (e) {
      // ignore
    }
    setLeaderboardSeen(true);
    // Persist server-side for cross-device visibility
    (async () => {
      try {
        await fetch('/api/users/leaderboard-seen', { method: 'POST', credentials: 'include' });
      } catch (e) {
        // ignore
      }
    })();
  }

  // Initialize seen state from server if user is authenticated
  const [hasFetchedLeaderboardSeen, setHasFetchedLeaderboardSeen] = useState(false);
  useEffect(() => {
    if (leaderboardSeen || hasFetchedLeaderboardSeen) return;
    setHasFetchedLeaderboardSeen(true);
    (async () => {
        try {
          const res = await fetch('/api/users/aboutme', { method: 'POST', credentials: 'include' });
          if (!res.ok) return;
          const json = await res.json();
          const user = json?.data;
          if (user && user.preferences && user.preferences.leaderboardSeen) {
            try { localStorage.setItem('leaderboard_toast_seen_v1', '1'); } catch (e) {}
            setLeaderboardSeen(true);
          }
        } catch (e) {
          // ignore
        }
    })();
  }, [leaderboardSeen, hasFetchedLeaderboardSeen]);

  // Logout logic moved to settings page

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">DailyNote</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isLeaderboard = item.name === "Leaderboard";
            const showNewBadge = isLeaderboard && !leaderboardSeen && !isActive && !collapsed;
            const content = (
              <>
                <div className="flex items-center">
                  <Icon className={cn("w-4 h-4", !collapsed && "mr-3")} />
                  {!collapsed && <span>{item.name}</span>}
                  {showNewBadge && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-amber-500 text-white text-[10px] px-2 py-0.5 font-semibold">New</span>
                  )}
                </div>
              </>
            );

            return (
              <Link key={item.name} href={item.href}>
                {showNewBadge ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer",
                          isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
                          collapsed && "px-2",
                        )}
                        onClick={() => markLeaderboardSeen()}
                      >
                        {content}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3">
                      <div className="text-sm font-medium">Leaderboard</div>
                      <div className="text-xs text-muted-foreground mt-1">A new feature — earn points for completing tasks and focus sessions. Compete weekly with others and track your progress.</div>
                      <div className="mt-3 text-right">
                        <Button size="sm" onClick={() => markLeaderboardSeen()}>Got it</Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer",
                      isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
                      collapsed && "px-2",
                    )}
                    onClick={(e) => {
                      if (isLeaderboard) {
                        e.preventDefault();
                        markLeaderboardSeen();
                        router.push(item.href);
                      }
                    }}
                  >
                    {content}
                  </Button>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Logout Button removed from sidebar */}
      </ScrollArea>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/60 text-center">Stay productive with DailyNote</div>
        </div>
      )}
    </div>
  );
}
