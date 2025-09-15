"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react"
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, isToday } from "date-fns"

interface HeatmapProps {
  className?: string
}

export function CalendarHeatmap({ className }: HeatmapProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()))

  // Generate 7 weeks of data for heatmap view
  const weeks = Array.from({ length: 7 }, (_, weekIndex) => {
    const weekStart = subDays(currentWeekStart, weekIndex * 7)
    const weekEnd = endOfWeek(weekStart)
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  }).reverse()

  // Mock completion data
  const getCompletionRate = (date: Date) => {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
    return Math.floor(Math.random() * 100)
  }

  const getIntensityClass = (rate: number) => {
    if (rate === 0) return "bg-muted/30"
    if (rate < 25) return "bg-primary/20"
    if (rate < 50) return "bg-primary/40"
    if (rate < 75) return "bg-primary/60"
    return "bg-primary/80"
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeekStart(newDate)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Activity Heatmap</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Day labels */}
          <div className="grid grid-cols-8 gap-1 text-xs text-muted-foreground">
            <div></div>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center">
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-8 gap-1">
              <div className="text-xs text-muted-foreground text-right pr-2 flex items-center">
                {format(week[0], "MMM d")}
              </div>
              {week.map((day, dayIndex) => {
                const completionRate = getCompletionRate(day)
                const isCurrentDay = isToday(day)

                return (
                  <div
                    key={dayIndex}
                    className={`
                      w-6 h-6 rounded-sm transition-all hover:scale-110 cursor-pointer
                      ${getIntensityClass(completionRate)}
                      ${isCurrentDay ? "ring-2 ring-primary ring-offset-1" : ""}
                    `}
                    title={`${format(day, "MMM d, yyyy")}: ${completionRate}% completion`}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-sm bg-muted/30"></div>
            <div className="w-3 h-3 rounded-sm bg-primary/20"></div>
            <div className="w-3 h-3 rounded-sm bg-primary/40"></div>
            <div className="w-3 h-3 rounded-sm bg-primary/60"></div>
            <div className="w-3 h-3 rounded-sm bg-primary/80"></div>
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  )
}
