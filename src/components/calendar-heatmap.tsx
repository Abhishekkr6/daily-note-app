"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, isToday, parseISO } from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface HeatmapProps {
  className?: string;
}

export function CalendarHeatmap({ className }: HeatmapProps) {
  const [selectedDay, setSelectedDay] = useState<{ date: string; completed: number; mood: number | null } | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [activityData, setActivityData] = useState<Array<{ date: string; completed: number; mood: number | null }>>([]);
  const moodColors = ["bg-[#e57373]", "bg-[#ffb74d]", "bg-[#e0e0e0]", "bg-[#81c784]", "bg-[#64b5f6]"]; // creative color for mood

  // Fetch activity and expose a refetchable function so we can update in real-time
  const fetchActivity = async () => {
    try {
      const res = await fetch("/api/activity");
      const data = await res.json();
      const normalized = Array.isArray(data) ? data : [];
      setActivityData(normalized);

      // If a day is selected, keep the selectedDay object in sync with the refreshed activity data
      if (selectedDay) {
        const updated = normalized.find((a: any) => a.date === selectedDay.date) || null;
        // Only update when something changed to avoid unnecessary re-renders
        if (!updated) {
          // if activity removed for the selected date, clear selection
          setSelectedDay(null);
        } else if (JSON.stringify(updated) !== JSON.stringify(selectedDay)) {
          setSelectedDay(updated);
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchActivity();
    const handler = () => fetchActivity();
    window.addEventListener("activityChanged", handler as EventListener);
    return () => window.removeEventListener("activityChanged", handler as EventListener);
  }, []);

  // Generate 7 weeks of data for heatmap view
  const weeks = Array.from({ length: 7 }, (_, weekIndex) => {
    const weekStart = subDays(currentWeekStart, weekIndex * 7);
    const weekEnd = endOfWeek(weekStart);
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }).reverse();

  // Get activity for a date
  const getActivity = (date: Date) => {
    // Use local date string in yyyy-MM-dd to match backend stored dates
    const d = format(date, "yyyy-MM-dd");
    return activityData.find((a) => a.date === d);
  };

  // When a day is selected, poll for updates for that specific day to keep popover realtime
  useEffect(() => {
    if (!selectedDay) return;
    let mounted = true;
    const poll = async () => {
      try {
        const res = await fetch("/api/activity");
        const data = await res.json();
        if (!mounted) return;
        const normalized = Array.isArray(data) ? data : [];
        setActivityData(normalized);
        const updated = normalized.find((a: any) => a.date === selectedDay.date) || null;
        if (!updated) {
          setSelectedDay(null);
        } else if (JSON.stringify(updated) !== JSON.stringify(selectedDay)) {
          setSelectedDay(updated);
        }
      } catch (err) {}
    };
    // Poll every 2 seconds while popover is open
    const id = setInterval(poll, 2000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [selectedDay]);

  // Creative color logic: if completed > 0, use intensity; else use mood color if mood exists
  const getCellClass = (activity?: { completed: number; mood: number | null }) => {
    if (!activity) return "bg-muted/30";
    if (activity.completed > 0) {
      if (activity.completed < 2) return "bg-primary/20";
      if (activity.completed < 4) return "bg-primary/40";
      if (activity.completed < 7) return "bg-primary/60";
      return "bg-primary/80";
    }
    if (activity.mood !== null && activity.mood >= -2 && activity.mood <= 2) {
      return moodColors[activity.mood + 2];
    }
    return "bg-muted/30";
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

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
                const activity = getActivity(day);
                const isCurrentDay = isToday(day);
                const cellTitle = activity
                  ? `${format(day, "MMM d, yyyy")}: ${activity.completed} tasks, Mood: ${
                      activity.mood !== null ? ["😢", "😞", "😐", "😊", "😄"][activity.mood + 2] : "-"
                    }`
                  : `${format(day, "MMM d, yyyy")}: No data`;

                return (
                  <Popover
                    key={dayIndex}
                    open={!!(selectedDay && activity && selectedDay.date === activity.date)}
                    onOpenChange={(open) => {
                      // When popover closes via escape/blur, clear selectedDay
                      if (!open) setSelectedDay(null);
                    }}
                  >
                    <PopoverTrigger asChild>
                      <div
                        className={`w-6 h-6 rounded-sm transition-all hover:scale-110 cursor-pointer ${getCellClass(activity)} ${isCurrentDay ? "ring-2 ring-primary ring-offset-1" : ""}`}
                        title={cellTitle}
                        onClick={() => activity && setSelectedDay(activity)}
                        onMouseEnter={() => activity && setSelectedDay(activity)}
                        onMouseLeave={() => {
                          // Delay clearing slightly to allow interacting with popover
                          setTimeout(() => {
                            // Only clear if mouse did not move into popover content
                            setSelectedDay((prev) => {
                              if (!prev) return null;
                              // keep selected if dates still match (popover likely opened)
                              return prev.date === (activity ? activity.date : prev.date) ? prev : null;
                            });
                          }, 100);
                        }}
                      ></div>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="center">
                      {activity && selectedDay?.date === activity.date && (
                        <div className="p-4 min-w-[180px]">
                          <div className="font-semibold mb-2">{format(parseISO(activity.date), "MMM d, yyyy")}</div>
                          <div className="mb-1">Completed Tasks: <span className="font-bold text-primary">{activity.completed}</span></div>
                          <div>Mood: <span className="text-2xl">{activity.mood !== null ? ["😢", "😞", "😐", "😊", "😄"][activity.mood + 2] : "-"}</span></div>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
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
          <div className="flex items-center gap-2 mt-1">
            <span className="mr-2">Mood Colors:</span>
            <span className="w-3 h-3 rounded-sm bg-[#e57373] inline-block" title="Very Bad"></span>
            <span className="w-3 h-3 rounded-sm bg-[#ffb74d] inline-block" title="Bad"></span>
            <span className="w-3 h-3 rounded-sm bg-[#e0e0e0] inline-block" title="Neutral"></span>
            <span className="w-3 h-3 rounded-sm bg-[#81c784] inline-block" title="Good"></span>
            <span className="w-3 h-3 rounded-sm bg-[#64b5f6] inline-block" title="Very Good"></span>
          </div>
          <div className="mt-2 text-muted-foreground">Click any cell to view details</div>
        </div>
      </CardContent>
    </Card>
  )
}
