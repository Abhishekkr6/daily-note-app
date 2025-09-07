"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, Target, Clock, Calendar, Flame, Award, CheckCircle2, Brain, Zap, Activity } from "lucide-react"
import { useState } from "react"

// Mock data for analytics
const weeklyData = [
  { day: "Mon", completed: 8, total: 12, focusMinutes: 180 },
  { day: "Tue", completed: 6, total: 10, focusMinutes: 120 },
  { day: "Wed", completed: 9, total: 11, focusMinutes: 240 },
  { day: "Thu", completed: 7, total: 9, focusMinutes: 160 },
  { day: "Fri", completed: 10, total: 13, focusMinutes: 200 },
  { day: "Sat", completed: 5, total: 7, focusMinutes: 90 },
  { day: "Sun", completed: 4, total: 6, focusMinutes: 60 },
]

const monthlyTrend = [
  { month: "Jan", completion: 75, tasks: 156 },
  { month: "Feb", completion: 82, tasks: 142 },
  { month: "Mar", completion: 78, tasks: 168 },
  { month: "Apr", completion: 85, tasks: 174 },
  { month: "May", completion: 88, tasks: 189 },
  { month: "Jun", completion: 92, tasks: 201 },
]

const priorityDistribution = [
  { name: "High", value: 25, color: "#ef4444" },
  { name: "Medium", value: 45, color: "#f59e0b" },
  { name: "Low", value: 30, color: "#10b981" },
]

const tagAnalytics = [
  { tag: "work", completed: 45, total: 52, percentage: 87 },
  { tag: "personal", completed: 23, total: 28, percentage: 82 },
  { tag: "health", completed: 18, total: 20, percentage: 90 },
  { tag: "learning", completed: 12, total: 16, percentage: 75 },
  { tag: "finance", completed: 8, total: 10, percentage: 80 },
]

const focusSessionData = [
  { date: "Week 1", sessions: 12, totalMinutes: 480 },
  { date: "Week 2", sessions: 15, totalMinutes: 600 },
  { date: "Week 3", sessions: 18, totalMinutes: 720 },
  { date: "Week 4", sessions: 14, totalMinutes: 560 },
]

export function StatsPage() {
  const [timeRange, setTimeRange] = useState("30d")

  const currentStreak = 7
  const longestStreak = 23
  const totalTasks = 1247
  const completionRate = 87
  const focusHours = 142
  const mostProductiveDay = "Wednesday"

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics & Insights</h1>
          <p className="text-muted-foreground">Track your productivity patterns and progress</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-3xl font-bold text-primary">{currentStreak}</p>
                <p className="text-xs text-muted-foreground mt-1">days in a row</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-3xl font-bold text-green-600">{completionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">this month</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Focus Hours</p>
                <p className="text-3xl font-bold text-blue-600">{focusHours}</p>
                <p className="text-xs text-muted-foreground mt-1">this month</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Most Productive</p>
                <p className="text-2xl font-bold text-amber-600">{mostProductiveDay}</p>
                <p className="text-xs text-muted-foreground mt-1">best day of week</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Weekly Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stackId="2"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted))"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary" />
              <span>Task Priority Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Completion Trend */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Monthly Completion Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="completion"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Focus Sessions */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-primary" />
              <span>Focus Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={focusSessionData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tag Performance */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-primary" />
              <span>Tag Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tagAnalytics.map((tag) => (
              <div key={tag.tag} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="text-xs">
                    #{tag.tag}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {tag.completed}/{tag.total} tasks
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${tag.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-10 text-right">{tag.percentage}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Achievement Summary */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-primary" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-xl border border-primary/20">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Streak Master</p>
                <p className="text-sm text-muted-foreground">Longest streak: {longestStreak} days</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-green-500/5 rounded-xl border border-green-500/20">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Task Crusher</p>
                <p className="text-sm text-muted-foreground">Completed {totalTasks} tasks total</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-blue-500/5 rounded-xl border border-blue-500/20">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Focus Champion</p>
                <p className="text-sm text-muted-foreground">{focusHours} hours of deep work</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-amber-500/5 rounded-xl border border-amber-500/20">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Consistency King</p>
                <p className="text-sm text-muted-foreground">{completionRate}% completion rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
