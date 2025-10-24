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
import { useState, useEffect } from "react"
// Helper: get weekday name from date string
function getWeekday(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" });
}




export function StatsPage() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);

  // Fetch and calculate key metrics and weekly progress
  useEffect(() => {
    async function fetchStats() {
      try {
        // Get all tasks
        const resTasks = await fetch("/api/tasks");
        if (!resTasks.ok) return;
        const tasks = await resTasks.json();


        // Get activity (last 49 days)
        const resActivity = await fetch("/api/activity");
        if (!resActivity.ok) return;
        let activity = await resActivity.json();
        // Sort activity by date descending (latest first)
  activity = activity.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // --- Calculate key metrics ---
        // 1. Current streak: count consecutive days from today with completed > 0
        let streak = 0;
        const todayStr = new Date().toISOString().slice(0, 10);
        let started = false;
        for (let i = 0; i < activity.length; i++) {
          if (!started) {
            // Start streak only if today is completed
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
        setCurrentStreak(streak);

        // 2. Longest streak (max consecutive days with completed > 0)
        let maxStreak = 0, curr = 0;
            for (let i = 0; i < activity.length; i++) {
              if (activity[i].completed > 0) curr++;
              else curr = 0;
              if (curr > maxStreak) maxStreak = curr;
            }
            setLongestStreak(maxStreak);
    
            // 3. Total tasks
            setTotalTasks(tasks.length);
    
            // 4. Completion rate (completed/total in last 30 days)
            const last30 = activity.slice(0, 30);
            const completed30 = last30.reduce((sum: number, d: any) => sum + d.completed, 0);
            setCompletionRate(tasks.length ? Math.round((completed30 / (tasks.length || 1)) * 100) : 0);
    
            // 5. Focus hours (sum of focusMinutes in last 30 days, if available)
            // Not available in backend, so set to null or 0 for now
            setFocusHours(null);
    
            // 6. Most productive day (day with max completed in last 30 days)
            let maxDay = last30[0];
            for (let d of last30) if (d.completed > maxDay.completed) maxDay = d;
            setMostProductiveDay(maxDay ? getWeekday(maxDay.date) : "");
    
            // --- Weekly Progress Chart Data ---
            // Show last 7 days, map to { day, completed, total }
            const last7 = activity.slice(0, 7).reverse();
            // For each day, count total tasks due (by dueDate) and completed
            const weekly = last7.map((d: any) => {
              const dayTasks = tasks.filter((t: any) => t.dueDate && t.dueDate.slice(0, 10) === d.date);
              return {
                day: getWeekday(d.date).slice(0, 3),
                completed: d.completed,
                total: dayTasks.length || 0,
                focusMinutes: null // Not available
              };
            });
            setWeeklyData(weekly);
    
            // --- Priority Distribution Chart Data ---
            const priorities = [
              { name: "High", color: "#ef4444" },
              { name: "Medium", color: "#f59e0b" },
              { name: "Low", color: "#10b981" },
            ];
            const priorityCounts = priorities.map(p => ({
              name: p.name,
              value: tasks.filter((t: any) => t.priority === p.name).length,
              color: p.color,
            }));
            setPriorityDistribution(priorityCounts);
    
            // --- Monthly Completion Trend Chart Data ---
            // Group activity by month, sum completed per month for last 12 months
            const monthMap: { [key: string]: number } = {};
            for (const d of activity) {
              const month = d.date.slice(0, 7); // YYYY-MM
              if (!monthMap[month]) monthMap[month] = 0;
              monthMap[month] += d.completed;
            }
            // Get last 12 months sorted ascending
            const months = Object.keys(monthMap).sort().slice(-12);
            const monthly = months.map(m => ({
              month: new Date(m + "-01").toLocaleString("en-US", { month: "short" }),
              completion: monthMap[m],
            }));
            setMonthlyTrend(monthly);
    
            // --- Focus Sessions Chart Data ---
            // Fetch pomodoro data for last 4 weeks
            const now = new Date();
            const focusWeeks: { [key: string]: { sessions: number; totalMinutes: number } } = {};
            for (let i = 0; i < 28; i++) {
              const d = new Date(now);
              d.setDate(now.getDate() - i);
              const dateStr = d.toISOString().slice(0, 10);
              // Fetch pomodoro for this date
              // eslint-disable-next-line no-await-in-loop
              const resPom = await fetch(`/api/pomodoro?date=${dateStr}`);
              if (!resPom.ok) continue;
              const pom = await resPom.json();
              if (!pom || !pom.cycles) continue;
              // Group by week number (0 = this week, 1 = last week, ...)
              const weekNum = Math.floor(i / 7);
              if (!focusWeeks[weekNum]) focusWeeks[weekNum] = { sessions: 0, totalMinutes: 0 };
              focusWeeks[weekNum].sessions += pom.cycles;
              focusWeeks[weekNum].totalMinutes += pom.cycles * (pom.duration || 25);
            }
            // Prepare data for chart (last 4 weeks, most recent last)
            const focusSessionArr = [3, 2, 1, 0].map(week => ({
              date: `Week ${4 - week}`,
              sessions: focusWeeks[week]?.sessions || 0,
              totalMinutes: focusWeeks[week]?.totalMinutes || 0,
            }));
            setFocusSessionData(focusSessionArr);
    
            // --- Tag Performance Section ---
            // Group tasks by tag, count completed and total per tag
            const tagMap: { [key: string]: { completed: number; total: number } } = {};
            for (const t of tasks) {
              if (!t.tag) continue;
              if (!tagMap[t.tag]) tagMap[t.tag] = { completed: 0, total: 0 };
              tagMap[t.tag].total++;
              if (t.status === "completed") tagMap[t.tag].completed++;
            }
            const tagArr = Object.entries(tagMap).map(([tag, data]) => ({
              tag,
              completed: data.completed,
              total: data.total,
              percentage: data.total ? Math.round((data.completed / data.total) * 100) : 0,
            }));
            setTagAnalytics(tagArr);
          } catch (e) {
            // handle error
          }
        }
    
        fetchStats();
        // Listen for activityChanged event for realtime stats update
        const handler = () => fetchStats();
        window.addEventListener('activityChanged', handler);
        return () => window.removeEventListener('activityChanged', handler);
      }, []);
    
      // State for completionRate, focusHours, mostProductiveDay, weeklyData, priorityDistribution, monthlyTrend, focusSessionData, tagAnalytics
      const [completionRate, setCompletionRate] = useState(0);
      const [focusHours, setFocusHours] = useState<number | null>(null);
      const [mostProductiveDay, setMostProductiveDay] = useState("");
      const [weeklyData, setWeeklyData] = useState<any[]>([]);
      const [priorityDistribution, setPriorityDistribution] = useState<any[]>([]);
      const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
      const [focusSessionData, setFocusSessionData] = useState<any[]>([]);
      const [tagAnalytics, setTagAnalytics] = useState<any[]>([]);
    
      return (
        <div className="space-y-8">

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
