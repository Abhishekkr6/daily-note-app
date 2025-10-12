"use client";

import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { CalendarHeatmap } from "./calendar-heatmap";

type Task = {
  _id?: string;
  title: string;
  status: "overdue" | "today" | "completed";
  tag?: string;
  priority?: "High" | "Medium" | "Low";
  dueDate?: string;
};

export function TodayDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [quickAddValue, setQuickAddValue] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deletedTask, setDeletedTask] = useState<Task | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [note, setNote] = useState("");
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [mood, setMood] = useState(0);
  const [moodNote, setMoodNote] = useState("");

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/tasks");
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchTasks();
  }, []);

  // Pomodoro timer
  useEffect(() => {
    if (!pomodoroActive) return;
    const interval = setInterval(() => {
      setPomodoroTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [pomodoroActive]);

  // Format time utility
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Quick Add handler
  const handleQuickAdd = async () => {
    if (!quickAddValue.trim()) return;
    const priority = quickAddValue.includes("!high")
      ? "High"
      : quickAddValue.includes("!medium")
      ? "Medium"
      : quickAddValue.includes("!low")
      ? "Low"
      : undefined;
    const tagMatch = quickAddValue.match(/#(\w+)/);
    const tag = tagMatch ? tagMatch[1] : undefined;
    const title = quickAddValue
      .replace(/#\w+/g, "")
      .replace(/!\w+/g, "")
      .trim();

    const newTask = { title, status: "today", priority, tag };
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to add task", error);
    }
    setQuickAddValue("");
  };

  // Delete task with undo
  const deleteTask = async (id: string) => {
  const taskToDelete = tasks.find((t) => t._id === id);
    if (!taskToDelete) return;

    setLoading(true);
    try {
      await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
      setDeletedTask(taskToDelete);
      setShowUndo(true);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = setTimeout(() => {
        setShowUndo(false);
        setDeletedTask(null);
      }, 5000);
    } catch (error) {
      console.error("Failed to delete task", error);
    }
    setLoading(false);
  };

  // Undo delete
  const handleUndo = async () => {
    if (!deletedTask) return;

    setLoading(true);
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deletedTask),
      });
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to restore task", error);
    } finally {
      setDeletedTask(null);
      setShowUndo(false);
      setLoading(false);
    }
  };

  // Edit task
  const startEditTask = (task: Task) => {
  setEditingTaskId(task._id ?? "");
  setEditValue(task.title);
  };

  const saveEditTask = async (id: string) => {
  const task = tasks.find((t) => t._id === id);
    if (!task) return;

    const updated = { ...task, title: editValue };

    setLoading(true);
    try {
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to edit task", error);
    } finally {
      setEditingTaskId(null);
      setEditValue("");
      setLoading(false);
    }
  };

  const cancelEditTask = () => {
    setEditingTaskId(null);
    setEditValue("");
  };

  const completeTask = async (id: string) => {
    const task = tasks.find((t) => t._id === id);
    if (!task) return;
    setLoading(true);
    try {
      const updated = { ...task, status: "completed" };
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to complete task", error);
    }
    setLoading(false);
  };

  const overdueTasks = tasks.filter((t) => t.status === "overdue");
  const todayTasks = tasks.filter((t) => t.status === "today");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const moodEmojis = ["😢", "😕", "😐", "🙂", "😊"];
  const moodLabels = ["Very Bad", "Bad", "Neutral", "Good", "Great"];

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
        <CardContent className="flex gap-2">
          <Input
            value={quickAddValue}
            onChange={(e) => setQuickAddValue(e.target.value)}
            placeholder="Add a task or note... (e.g., 'Finish report tomorrow 2pm #work !high')"
            className="text-base bg-background border-border focus:border-primary transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
          />
          <Button onClick={handleQuickAdd} disabled={loading}>
            Add
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Tasks */}
          <TaskSection
            title="Overdue"
            color="text-destructive"
            icon={<Clock className="w-5 h-5" />}
            tasks={overdueTasks}
            completeTask={completeTask}
            setTasks={setTasks}
          />

          {/* Today Tasks */}
          <TaskSection
            title="Today"
            color="text-primary"
            icon={<CheckCircle2 className="w-5 h-5" />}
            tasks={todayTasks}
            completeTask={completeTask}
            startEditTask={startEditTask}
            deleteTask={deleteTask}
            editingTaskId={editingTaskId}
            editValue={editValue}
            setEditValue={setEditValue}
            saveEditTask={saveEditTask}
            cancelEditTask={cancelEditTask}
            showUndo={showUndo}
            deletedTask={deletedTask}
            handleUndo={handleUndo}
            setTasks={setTasks}
          />

          {/* Completed Tasks */}
          <TaskSection
            title="Completed"
            color="text-muted-foreground"
            icon={<CheckCircle2 className="w-5 h-5" />}
            tasks={completedTasks}
            onReopen={async (id: string) => {
              const task = tasks.find((t) => t._id === id);
              if (!task) return;
              setLoading(true);
              try {
                const updated = { ...task, status: "today" };
                await fetch("/api/tasks", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(updated),
                });
                const res = await fetch("/api/tasks");
                const data = await res.json();
                setTasks(data);
              } catch (error) {
                console.error("Failed to reopen task", error);
              }
              setLoading(false);
            }}
            setTasks={setTasks}
          />

          <CalendarHeatmap />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Notes */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle>Today's Note</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Write your thoughts, reflections, or notes for today..."
                className="min-h-32 bg-background border-border resize-none"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Pomodoro Timer */}
          <PomodoroTimer
            pomodoroActive={pomodoroActive}
            setPomodoroActive={setPomodoroActive}
            pomodoroTime={pomodoroTime}
            formatTime={formatTime}
            reset={() => {
              setPomodoroActive(false);
              setPomodoroTime(25 * 60);
            }}
            currentTask={todayTasks[0]?.title}
          />

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
                      mood === index - 2
                        ? "bg-primary/20 scale-110"
                        : "hover:bg-muted/50 hover:scale-105"
                    }`}
                    title={moodLabels[index]}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {moodLabels[mood + 2]}
              </p>
              <Input
                placeholder="Optional note about your mood..."
                className="text-sm bg-background border-border"
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Reusable Pomodoro component
function PomodoroTimer({
  pomodoroActive,
  setPomodoroActive,
  pomodoroTime,
  formatTime,
  reset,
  currentTask,
}: {
  pomodoroActive: boolean;
  setPomodoroActive: (val: boolean) => void;
  pomodoroTime: number;
  formatTime: (s: number) => string;
  reset: () => void;
  currentTask?: string;
}) {
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-primary" />
          <span>Focus Timer</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="text-4xl font-mono font-bold text-primary">
          {formatTime(pomodoroTime)}
        </div>
        <div className="flex justify-center space-x-2">
          <Button
            variant={pomodoroActive ? "secondary" : "default"}
            size="sm"
            onClick={() => setPomodoroActive(!pomodoroActive)}
          >
            {pomodoroActive ? (
              <>
                <Pause className="w-4 h-4 mr-2" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" /> Start
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {currentTask ? `Working on: ${currentTask}` : "No active task"}
        </p>
      </CardContent>
    </Card>
  );
}

// Move TaskSection outside so it is in scope for TodayDashboard
function TaskSection({
  title,
  color,
  icon,
  tasks,
  completeTask,
  startEditTask,
  deleteTask,
  editingTaskId,
  editValue,
  setEditValue,
  saveEditTask,
  cancelEditTask,
  showUndo,
  deletedTask,
  handleUndo,
  onReopen,
}: any) {
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle className={`${color} flex items-center space-x-2`}>
          {icon}
          <span>
            {title} ({tasks.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-muted-foreground">No {title.toLowerCase()} tasks</div>
        ) : (
          tasks.map((task: Task) => (
            <div
              key={task._id}
              className={`flex items-center space-x-3 p-3 rounded-xl border relative z-10 ${title === "Completed" ? "bg-muted/40 border-muted text-muted-foreground opacity-70" : "bg-accent/30 border-accent"}`}
            >
              {completeTask && title !== "Completed" && (
                <button
                  type="button"
                  onClick={() => completeTask(task._id ?? "")}
                  className="focus:outline-none"
                  title="Complete task"
                >
                  <Circle className="w-5 h-5 text-primary" />
                </button>
              )}
              {onReopen && title === "Completed" && (
                <button
                  type="button"
                  className="focus:outline-none"
                  onClick={() => onReopen(task._id ?? "")}
                  title="Reopen task"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </button>
              )}
              <div className="flex-1">
                {editingTaskId === task._id && title !== "Completed" ? (
                  <div className="flex gap-2 items-center">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => saveEditTask(task._id ?? "")}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEditTask}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className={`font-medium ${title === "Completed" ? "line-through" : "text-foreground"}`}>{task.title}</p>
                    {task.tag && (
                      <p className="text-sm text-muted-foreground">#{task.tag}</p>
                    )}
                  </>
                )}
              </div>
              {task.priority && title !== "Completed" && (
                <Badge variant="destructive" className="text-xs">
                  {task.priority}
                </Badge>
              )}
              {startEditTask && deleteTask && title !== "Completed" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="focus:outline-none bg-transparent p-1 rounded hover:bg-muted"
                      title="More options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => startEditTask(task)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteTask(task._id ?? "")}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))
        )}
        {showUndo && deletedTask && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-destructive">Task deleted</span>
            <Button size="sm" variant="outline" onClick={handleUndo}>
              Undo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
