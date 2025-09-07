"use client"

import { Search, Moon, Sun, User, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"

export function TopBar() {
  const { theme, setTheme } = useTheme()

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-background border-b border-border">
      {/* Left section - Date */}
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{currentDate}</h1>
          <p className="text-sm text-muted-foreground">Welcome back to your daily workspace</p>
        </div>
      </div>

      {/* Center section - Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes and tasks..."
            className="pl-10 bg-muted/50 border-border focus:bg-background transition-colors"
          />
        </div>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center space-x-4">
        {/* Streak Counter */}
        <Badge variant="secondary" className="flex items-center space-x-1 px-3 py-1">
          <Flame className="w-3 h-3 text-primary" />
          <span className="text-sm font-medium">7 day streak</span>
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
  )
}
