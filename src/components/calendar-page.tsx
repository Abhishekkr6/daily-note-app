"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, CalendarIcon, CheckCircle2, Circle, Clock } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns"

interface DayData {
  date: Date
  tasks: Array<{
    id: string
    title: string
    status: "todo" | "in-progress" | "completed" | "overdue" | "today"
    priority: "low" | "medium" | "high" | "Low" | "Medium" | "High"
  }>
  note?: string
  completionRate: number
}
// Replace mock data with real user data fetched from the API
interface TaskFromApi {
  _id: string
  title: string
  status: string
  priority?: string
  dueDate?: string
  updatedAt?: string
}

// Helper to convert Date -> YYYY-MM-DD using local timezone (avoids UTC shifts)
const toDateKey = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}


export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null)
  const [showDayDetail, setShowDayDetail] = useState(false)
  const [tasksByDate, setTasksByDate] = useState<Record<string, TaskFromApi[]>>({})
  const [loadingTasks, setLoadingTasks] = useState(false)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Add padding days for calendar grid
  const startDay = monthStart.getDay()
  const paddingDays = Array.from({ length: startDay }, (_, i) => {
    const paddingDate = new Date(monthStart)
    paddingDate.setDate(paddingDate.getDate() - (startDay - i))
    return paddingDate
  })

  const endDay = monthEnd.getDay()
  const endPaddingDays = Array.from({ length: 6 - endDay }, (_, i) => {
    const paddingDate = new Date(monthEnd)
    paddingDate.setDate(paddingDate.getDate() + (i + 1))
    return paddingDate
  })

  const allDays = [...paddingDays, ...calendarDays, ...endPaddingDays]

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    setCurrentDate(newDate)
  }

  const handleDayClick = async (date: Date) => {
    const key = toDateKey(date)
    const tasks = tasksByDate[key] ?? []
    // Compute completion rate
    const completed = tasks.filter((t) => t.status === "completed").length
    const completionRate = tasks.length > 0 ? (completed / tasks.length) * 100 : 0

    // Fetch note for the date
    let note = undefined
    try {
      const res = await fetch(`/api/note?date=${key}`)
      if (res.ok) {
        const json = await res.json()
        note = json.content || json.note || undefined
      }
    } catch (err) {
      // ignore note fetch errors; keep note undefined
    }

    const dayData: DayData = {
      date,
      tasks: tasks.map((t) => ({
        id: t._id,
        title: t.title,
        status: (t.status === "completed"
          ? "completed"
          : t.status === "today"
            ? "in-progress"
            : t.status === "overdue"
              ? "todo"
              : t.status) as "todo" | "in-progress" | "completed" | "overdue" | "today",
        priority: (t.priority ? t.priority.toLowerCase() : "low") as "low" | "medium" | "high" | "Low" | "Medium" | "High"
      })),
      note,
      completionRate,
    }

    setSelectedDay(dayData)
    setShowDayDetail(true)
  }

  const getCompletionColor = (rate: number) => {
    if (rate === 0) return "bg-muted/30"
    if (rate < 30) return "bg-red-200 dark:bg-red-900/30"
    if (rate < 60) return "bg-amber-200 dark:bg-amber-900/30"
    if (rate < 90) return "bg-green-200 dark:bg-green-900/30"
    return "bg-primary/30"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-primary" />
      case "in-progress":
        return <Clock className="w-4 h-4 text-amber-500" />
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "secondary"
    }
  }

  // Fetch tasks for the user and group by date key (prefer dueDate, else use updatedAt date)
  useEffect(() => {
    let cancelled = false
    const loadTasks = async () => {
      setLoadingTasks(true)
      try {
        const res = await fetch(`/api/tasks`)
        if (!res.ok) return
        const tasks: TaskFromApi[] = await res.json()
        if (cancelled) return
        const map: Record<string, TaskFromApi[]> = {}
        tasks.forEach((t) => {
          // Prefer explicit dueDate (which may already be YYYY-MM-DD). Otherwise use updatedAt
          let key: string | undefined = undefined
          if (t.dueDate) {
            // If dueDate already looks like YYYY-MM-DD, use as-is. If it contains a time, parse it.
            if (t.dueDate.includes("T")) {
              const dt = new Date(t.dueDate)
              key = toDateKey(dt)
            } else {
              // If dueDate is DD-MM-YYYY or other, try to parse
              if (/\d{4}-\d{2}-\d{2}/.test(t.dueDate)) {
                key = t.dueDate
              } else {
                // Try to parse other formats
                const dt = new Date(t.dueDate)
                if (!isNaN(dt.getTime())) key = toDateKey(dt)
              }
            }
          } else if (t.updatedAt) {
            const dt = new Date(t.updatedAt)
            if (!isNaN(dt.getTime())) key = toDateKey(dt)
          }
          if (!key) key = toDateKey(new Date())
          if (!map[key]) map[key] = []
          map[key].push(t)
        })
        setTasksByDate(map)
      } catch (err) {
        // ignore
      } finally {
        if (!cancelled) setLoadingTasks(false)
      }
    }

    loadTasks()
    return () => {
      cancelled = true
    }
  }, [currentDate])

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Calendar</h1>
          <p className="text-sm md:text-base text-muted-foreground">Track your daily progress and completion rates</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <span>{format(currentDate, "MMMM yyyy")}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-4">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-1 md:p-2 text-center text-xs md:text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {allDays.map((date, index) => {
              const key = toDateKey(date)
              const tasks = tasksByDate[key] ?? []
              const completed = tasks.filter((t) => t.status === "completed").length
              const completionRate = tasks.length > 0 ? (completed / tasks.length) * 100 : 0
              const dayData: DayData = {
                date,
                tasks: tasks.map((t) => ({ id: t._id, title: t.title, status: (t.status as any) || "todo", priority: (t.priority || "low") as any })),
                note: undefined,
                completionRate,
              }
              const isCurrentMonth = isSameMonth(date, currentDate)
              const isCurrentDay = isToday(date)

              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(date)}
                  className={`
                    relative p-1 md:p-2 h-14 md:h-20 rounded-lg md:rounded-xl border transition-all hover:shadow-md hover:scale-105 cursor-pointer text-xs md:text-sm
                    ${isCurrentMonth ? "bg-background border-border" : "bg-muted/20 border-muted"}
                    ${isCurrentDay ? "ring-1 md:ring-2 ring-primary ring-offset-1 md:ring-offset-2" : ""}
                    ${getCompletionColor(dayData.completionRate)}
                  `}
                >
                  <div className="flex flex-col h-full">
                    <span
                      className={`text-sm font-medium ${isCurrentMonth ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {format(date, "d")}
                    </span>

                    {isCurrentMonth && dayData.tasks.length > 0 && (
                      <div className="flex-1 flex flex-col justify-center items-center space-y-1">
                        <div className="text-xs text-muted-foreground">
                          {dayData.tasks.filter((t) => t.status === "completed").length}/{dayData.tasks.length}
                        </div>
                        <div className="flex space-x-1">
                          {dayData.tasks.slice(0, 3).map((task, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                          ))}
                          {dayData.tasks.length > 3 && (
                            <div className="text-xs text-muted-foreground">+{dayData.tasks.length - 3}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs md:text-sm text-muted-foreground px-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-muted/30"></div>
              <span>No tasks</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-red-200 dark:bg-red-900/30"></div>
              <span>Low completion</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-amber-200 dark:bg-amber-900/30"></div>
              <span>Medium completion</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-green-200 dark:bg-green-900/30"></div>
              <span>High completion</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-primary/30"></div>
              <span>Perfect completion</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Modal */}
      <Dialog open={showDayDetail} onOpenChange={setShowDayDetail}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <span>{selectedDay && format(selectedDay.date, "EEEE, MMMM d, yyyy")}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedDay && (
            <div className="space-y-6">
              {/* Completion Summary */}
              <Card className="bg-muted/20 border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                      <p className="text-2xl font-bold text-primary">{Math.round(selectedDay.completionRate)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Tasks</p>
                      <p className="text-lg font-semibold">
                        {selectedDay.tasks.filter((t) => t.status === "completed").length} / {selectedDay.tasks.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tasks for the day */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Tasks</h3>
                <div className="space-y-2">
                  {selectedDay.tasks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No tasks for this day</p>
                  ) : (
                    selectedDay.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center space-x-3 p-3 bg-background rounded-xl border border-border"
                      >
                        {getStatusIcon(task.status)}
                        <div className="flex-1">
                          <p
                            className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}
                          >
                            {task.title}
                          </p>
                        </div>
                        <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                          {task.priority}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Daily Note */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Daily Note</h3>
                <Card className="bg-background border-border">
                  <CardContent className="p-4">
                    {selectedDay.note ? (
                      <p className="text-foreground">{selectedDay.note}</p>
                    ) : (
                      <p className="text-muted-foreground italic">No note for this day</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDayDetail(false)}>
                  Close
                </Button>
                <Button>Edit Day</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
