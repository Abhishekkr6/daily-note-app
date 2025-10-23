"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { Calendar, CheckSquare, BarChart3, FileText, Settings, Home, ChevronLeft, ChevronRight } from "lucide-react"

interface SidebarProps {
  className?: string
}

const navigation = [
  { name: "Today", href: "/home", icon: Home },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "All Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Stats", href: "/stats", icon: BarChart3 },
  { name: "Templates", href: "/templates", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer",
                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
                    collapsed && "px-2",
                  )}
                >
                  <Icon className={cn("w-4 h-4", !collapsed && "mr-3")} />
                  {!collapsed && <span>{item.name}</span>}
                </Button>
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
