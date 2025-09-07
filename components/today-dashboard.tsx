"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Clock, CheckCircle2, Circle, MoreHorizontal, Play, Pause, RotateCcw } from "lucide-react"
import { useState } from "react"
import { CalendarHeatmap } from "./calendar-heatmap"

export function TodayDashboard() {
  const [pomodoroActive, setPomodoroActive] = useState(false)
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60) // 25 minutes in seconds
  const [mood, setMood] = useState(0) // -2 to +2

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const moodEmojis = ["😢", "😕", "😐", "🙂", "😊"]
  const moodLabels = ["Very Bad", "Bad", "Neutral", "Good", "Great"]

  return (
    <div className="p-6 space-y-6">
      {/* Quick Add Section */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-primary" />
            <span>Quick Add</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Add a task or note... (e.g., 'Finish report tomorrow 2pm #work !high')"
            className="text-base bg-background border-border focus:border-primary transition-colors"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Tasks */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Overdue (2)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-destructive/5 rounded-xl border border-destructive/20">
                <Circle className="w-5 h-5 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Review quarterly reports</p>
                  <p className="text-sm text-muted-foreground">Due yesterday • #work</p>
                </div>
                <Badge variant="destructive" className="text-xs">
                  High
                </Badge>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-destructive/5 rounded-xl border border-destructive/20">
                <Circle className="w-5 h-5 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Call dentist for appointment</p>
                  <p className="text-sm text-muted-foreground">Due 2 days ago • #personal</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Medium
                </Badge>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Today's Tasks */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-primary flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Today (4)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-accent/30 rounded-xl border border-accent">
                <Circle className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Prepare presentation slides</p>
                  <p className="text-sm text-muted-foreground">Due today 3:00 PM • #work</p>
                </div>
                <Badge variant="destructive" className="text-xs">
                  High
                </Badge>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-xl">
                <Circle className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Buy groceries</p>
                  <p className="text-sm text-muted-foreground">Due today • #personal</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Low
                </Badge>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-xl">
                <Circle className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Read chapter 5</p>
                  <p className="text-sm text-muted-foreground">Due today • #learning</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Medium
                </Badge>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-muted-foreground flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Completed (3)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-xl opacity-60">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-foreground line-through">Morning workout</p>
                  <p className="text-sm text-muted-foreground">Completed at 7:30 AM • #health</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-xl opacity-60">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-foreground line-through">Check emails</p>
                  <p className="text-sm text-muted-foreground">Completed at 9:15 AM • #work</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar Heatmap */}
          <CalendarHeatmap />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Daily Note */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Today's Note</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Write your thoughts, reflections, or notes for today..."
                className="min-h-32 bg-background border-border resize-none"
                defaultValue="Had a productive morning. The new project is coming along well. Need to focus on the presentation this afternoon."
              />
            </CardContent>
          </Card>

          {/* Pomodoro Timer */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>Focus Timer</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-4xl font-mono font-bold text-primary">{formatTime(pomodoroTime)}</div>
              <div className="flex justify-center space-x-2">
                <Button
                  variant={pomodoroActive ? "secondary" : "default"}
                  size="sm"
                  onClick={() => setPomodoroActive(!pomodoroActive)}
                >
                  {pomodoroActive ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPomodoroTime(25 * 60)
                    setPomodoroActive(false)
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Working on: Prepare presentation slides</p>
            </CardContent>
          </Card>

          {/* Mood Tracker */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle>How are you feeling?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                {moodEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => setMood(index - 2)}
                    className={`text-2xl p-2 rounded-xl transition-all ${
                      mood === index - 2 ? "bg-primary/20 scale-110" : "hover:bg-muted/50 hover:scale-105"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground">{moodLabels[mood + 2]}</p>
              <Input placeholder="Optional note about your mood..." className="text-sm bg-background border-border" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
