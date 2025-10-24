"use client";

;
import { useEffect, useRef, useState } from "react";
// Softer blink + wavy border animation
const blinkStyle = `
@keyframes blink-quickadd {
  0%, 100% {
    box-shadow: 0 0 0 0 transparent;
    transform: scale(1);
    border-width: 1.5px;
    filter: none;
  }
  20%, 80% {
    box-shadow: 0 0 0 3px #D86D38;
    transform: scale(1.01);
    border-width: 1.5px;
    filter: url(#wavy-border);
  }
  40%, 60% {
    box-shadow: 0 0 0 0 transparent;
    transform: scale(1);
    border-width: 1.5px;
    filter: none;
  }
}
`;

type MoodEntry = {
  date: string;
  mood: number;
  note?: string;
};

// Fetch all tasks on mount (move inside TodayDashboard)
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Task = {
  _id?: string;
  title: string;
  description?: string;
  status: "overdue" | "today" | "completed";
  tag?: string;
  priority?: "High" | "Medium" | "Low";
  dueDate?: string;
  completedDate?: string;
  notificationTime?: string; // Add this line
};

export function TodayDashboard() {
  // Refetch tasks every minute for real-time notification
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTasks();
    }, 60000); // every 60 seconds
    return () => clearInterval(interval);
  }, []);

  // Refetch tasks at midnight to update overdue status automatically
  useEffect(() => {
    // Calculate ms until next midnight
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();
    const timeout = setTimeout(() => {
      fetchTasks();
      // Set interval for future midnights
      setInterval(fetchTasks, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
    return () => clearTimeout(timeout);
  }, []);
  // Notification popup and alarm logic
  const [activeNotification, setActiveNotification] = useState<{ id: string; title: string; time: string } | null>(null);
  const alarmAudioRef = useRef<HTMLAudioElement>(null);
  // Track dismissed notifications for this session (taskId+time)
  const dismissedNotificationsRef = useRef<Set<string>>(new Set());
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
      const todayStr = now.toISOString().slice(0, 10);
      // Check for any today task with notificationTime matching current time
      const match = tasks.find(
        (t) => t.status === "today" && t.notificationTime === currentTime && (!t.dueDate || t.dueDate === todayStr)
      );
      if (match) {
        const key = `${match._id}_${currentTime}`;
        if (!dismissedNotificationsRef.current.has(key) && (!activeNotification || activeNotification.id !== match._id || activeNotification.time !== currentTime)) {
          setActiveNotification({ id: match._id ?? "", title: match.title, time: currentTime });
          if (alarmAudioRef.current) {
            alarmAudioRef.current.currentTime = 0;
            alarmAudioRef.current.play();
          }
        }
      }
    }, 1000); // check every second for accuracy
    return () => clearInterval(interval);
  }, [tasks, activeNotification]);

  // Auto-dismiss notification after 10 seconds
  useEffect(() => {
    if (activeNotification) {
      const timer = setTimeout(() => {
        // Mark as dismissed for this session
        dismissedNotificationsRef.current.add(`${activeNotification.id}_${activeNotification.time}`);
        setActiveNotification(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [activeNotification]);
  const [quickAddStatus, setQuickAddStatus] = useState<'idle' | 'loading' | 'added'>('idle');
  // Validation helpers
  function isValidTitle(title: string) {
    // Allow numbers anywhere except the first character
    return /^[^\d][\w\s\d]{1,}$/.test(title.trim()); // at least 2 chars, first char not a digit
  }
  function isValidDescription(desc: string) {
    // Allow numbers anywhere except the first character
    return /^[^\d][\w\s\d]{4,}$/.test(desc.trim()); // at least 5 chars, first char not a digit
  }
  const [blinkQuickAdd, setBlinkQuickAdd] = useState(false);
  // Blink quick add if sessionStorage flag is set
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      sessionStorage.getItem("quickAddBlink") === "true"
    ) {
      setBlinkQuickAdd(true);
      sessionStorage.removeItem("quickAddBlink");
      setTimeout(() => setBlinkQuickAdd(false), 1200); // 2-3 blinks (600ms per blink)
    }
  }, []);
  // Get today's date in YYYY-MM-DD format
  const todayDate = new Date().toISOString().slice(0, 10);

  // Persist notification times from backend
  const [emailTime, setEmailTime] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [quickAddLoading, setQuickAddLoading] = useState(false);
  const [quickAddValue, setQuickAddValue] = useState("");
  const [quickAddPriority, setQuickAddPriority] = useState<string>("");
  const [quickAddDescription, setQuickAddDescription] = useState("");
  const [quickAddTag, setQuickAddTag] = useState("");
  // Get all unique tags from tasks, ensuring only strings
  const allTags = Array.from(
    new Set(tasks.map((t) => t.tag).filter((tag): tag is string => typeof tag === "string"))
  );
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTag, setEditTag] = useState("");
  const [editPriority, setEditPriority] = useState<string>("");
  const [deletedTask, setDeletedTask] = useState<Task | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track the current working task id for Pomodoro reset
  const workingTaskIdRef = useRef<string | undefined>(undefined);

  const [pomodoroCycles, setPomodoroCycles] = useState(0);
  const [pomodoroTime, setPomodoroTime] = useState(0); // Add this line
  const [pomodoroDuration, setPomodoroDuration] = useState(25); // Add this line (default 25 min)
  const [pomodoroActive, setPomodoroActive] = useState(false); // Add this line
  const audioRef = useRef<HTMLAudioElement>(null); // Add this line

  const [note, setNote] = useState(""); // Add this line
  const [noteLoading, setNoteLoading] = useState(false); // Add this line
  const [noteSaved, setNoteSaved] = useState(false); // Add this line

  // Fetch all tasks on mount
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
      // Set notification times from backend
      const times: { [key: string]: string } = {};
      data.forEach((task: any) => {
        if (task._id && task.notificationTime) {
          times[task._id] = task.notificationTime;
        }
      });
      setEmailTime(times);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchTasks();
  }, []);

  // Listen for activityChanged event to refetch tasks in realtime
  useEffect(() => {
    const handleActivityChanged = () => {
      fetchTasks();
    };
    window.addEventListener("activityChanged", handleActivityChanged);
    return () => {
      window.removeEventListener("activityChanged", handleActivityChanged);
    };
  }, []);

  // Fetch Pomodoro data on mount
  useEffect(() => {
    const fetchPomodoro = async () => {
      try {
        const res = await fetch(`/api/pomodoro?date=${todayDate}`);
        const data = await res.json();
        if (data && typeof data.cycles === "number")
          setPomodoroCycles(data.cycles);
        if (data && typeof data.duration === "number") {
          setPomodoroDuration(data.duration);
          setPomodoroTime(data.duration * 60);
        }
      } catch (err) {
        console.error("Failed to fetch pomodoro", err);
      }
    };
    fetchPomodoro();
  }, [todayDate]);

  // Save Pomodoro cycles/duration to backend
  const savePomodoro = async (cycles: number, duration: number) => {
    try {
      await fetch("/api/pomodoro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cycles, duration, date: todayDate }),
      });
    } catch (err) {
      console.error("Failed to save pomodoro", err);
    }
  };

  // Pomodoro timer with notification and sound
  useEffect(() => {
    if (!pomodoroActive) return;
    if (pomodoroTime === 0) {
      setPomodoroActive(false);
      setPomodoroCycles((prev) => {
        const next = prev + 1;
        savePomodoro(next, pomodoroDuration);
        return next;
      });
      // Show browser notification
      if (window.Notification && Notification.permission === "granted") {
        new Notification("Pomodoro Complete!", { body: "Time for a break!" });
      }
      // Play sound
      if (audioRef.current) {
        audioRef.current.play();
      }
      return;
    }
    const interval = setInterval(() => {
      setPomodoroTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [pomodoroActive, pomodoroTime]);

  // Request notification permission on mount
  useEffect(() => {
    if (window.Notification && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

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
  setQuickAddStatus('loading');
    const title = quickAddValue.replace(/#\w+/g, "").trim();
    const description = quickAddDescription.trim();
    if (
      !isValidTitle(title) ||
      !isValidDescription(description) ||
      !quickAddPriority
    ) {
      setQuickAddStatus('idle');
      return;
    }
    const tagMatch = quickAddValue.match(/#(\w+)/);
    const tag = quickAddTag || undefined;
    const newTask = {
      title,
      description,
      status: "today",
      priority: quickAddPriority,
      tag,
      dueDate: todayDate, // Default dueDate set to today
    };
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
      window.dispatchEvent(new Event("activityChanged"));
    } catch (error) {
      console.error("Failed to add task", error);
    }
  setQuickAddValue("");
  setQuickAddPriority("");
  setQuickAddDescription("");
  setQuickAddTag("");
  setQuickAddStatus('added');
  setTimeout(() => setQuickAddStatus('idle'), 1200);
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
        body: JSON.stringify({ _id: id }),
      });
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
      window.dispatchEvent(new Event("activityChanged"));
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
      // Notify heatmap/activity listeners
      window.dispatchEvent(new Event("activityChanged"));
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
    setEditDescription(task.description || "");
    setEditTag(task.tag || "");
    setEditPriority(task.priority || "");
  };

  const saveEditTask = async (id: string) => {
    const task = tasks.find((t) => t._id === id);
    if (!task) return;

    const updated = {
      ...task,
      title: editValue,
      description: editDescription,
      tag: editTag,
      priority: editPriority,
    };

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
      window.dispatchEvent(new Event("activityChanged"));
    } catch (error) {
      console.error("Failed to edit task", error);
    } finally {
      setEditingTaskId(null);
      setEditValue("");
      setEditDescription("");
      setEditTag("");
      setEditPriority("");
      setLoading(false);
    }
  };

  const cancelEditTask = () => {
    setEditingTaskId(null);
    setEditValue("");
    setEditDescription("");
    setEditTag("");
    setEditPriority("");
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
      window.dispatchEvent(new Event("activityChanged"));
    } catch (error) {
      console.error("Failed to complete task", error);
    }
    setLoading(false);
  };

  // Fetch today's note on mount
  useEffect(() => {
    const fetchNote = async () => {
      setNoteLoading(true);
      try {
        const res = await fetch(`/api/note?date=${todayDate}`);
        const data = await res.json();
        setNote(data?.content || "");
      } catch (err) {
        console.error(err);
      }
      setNoteLoading(false);
    };
    fetchNote();
  }, [todayDate]);

  // Save note handler
  const handleSaveNote = async () => {
    setNoteLoading(true);
    setNoteSaved(false);
    try {
      await fetch("/api/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: note, date: todayDate }),
      });
      setNoteSaved(true);
    } catch (err) {
      console.error("Failed to save note", err);
    }
    setNoteLoading(false);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  // Save duration change to backend
  const handleDurationChange = (val: number) => {
    setPomodoroDuration(val);
    if (!pomodoroActive) setPomodoroTime(val * 60);
    savePomodoro(pomodoroCycles, val);
  };

  // Filter tasks by status
  const todayTasks = tasks.filter((t) => t.status === "today");
  const overdueTasks = tasks.filter((t) => t.status === "overdue");
  // Only show completed tasks for today
  const completedTasks = tasks.filter(
    (t) => t.status === "completed" && (t.completedDate === todayDate || t.dueDate === todayDate)
  );

  // Mood tracker state and data
  const moodEmojis = ["😢", "😞", "😐", "😊", "😄"];
  const moodLabels = ["Very Bad", "Bad", "Neutral", "Good", "Very Good"];
  const [mood, setMood] = useState(0); // -2 to +2, default neutral
  const [moodNote, setMoodNote] = useState("");
  const [moodLoading, setMoodLoading] = useState(false);
  const [moodSaved, setMoodSaved] = useState(false);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  // Fetch today's mood on mount
  useEffect(() => {
    const fetchMood = async () => {
      setMoodLoading(true);
      try {
        const res = await fetch(`/api/mood?date=${todayDate}`);
        const data = await res.json();
        if (data && typeof data.mood === "number") {
          setMood(data.mood);
          setMoodNote(data.note || "");
        }
      } catch (err) {
        // ignore
      }
      setMoodLoading(false);
    };
    fetchMood();
  }, [todayDate]);

  // Save mood to backend
  const saveMood = async (newMood = mood, newNote = moodNote) => {
    setMoodLoading(true);
    setMoodSaved(false);
    try {
      await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayDate, mood: newMood, note: newNote }),
      });
      // Refetch mood from backend for real-time update
      const res = await fetch(`/api/mood?date=${todayDate}`);
      const data = await res.json();
      if (data && typeof data.mood === "number") {
        setMood(data.mood);
        setMoodNote(data.note || "");
      }
      // Refetch mood history for last 7 days
      const historyRes = await fetch("/api/mood");
      const historyData = await historyRes.json();
      setMoodHistory(Array.isArray(historyData) ? historyData : []);
      setMoodSaved(true);
      // Notify heatmap/activity listeners to refetch activity (tasks+mood)
      window.dispatchEvent(new Event("activityChanged"));
      setTimeout(() => setMoodSaved(false), 2000);
    } catch (err) {
      // Optionally show error
    }
    setMoodLoading(false);
  };

  // Fetch mood history (last 30 days)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/mood");
        const data = await res.json();
        setMoodHistory(Array.isArray(data) ? data : []);
      } catch (err) {}
    };
    fetchHistory();
  }, []);

  // Whenever todayTasks change, reset Pomodoro if current working task is completed or no tasks remain
  useEffect(() => {
    // If no today tasks, reset Pomodoro
    if (todayTasks.length === 0) {
      setPomodoroActive(false);
      setPomodoroTime(pomodoroDuration * 60);
      workingTaskIdRef.current = undefined;
      return;
    }
    // Get the current working task id (first today task)
    const currentWorkingTaskId = todayTasks[0]?._id;
    // If timer is active and the previous working task is not in todayTasks, reset
    if (
      pomodoroActive &&
      workingTaskIdRef.current &&
      !todayTasks.some((t) => t._id === workingTaskIdRef.current)
    ) {
      setPomodoroActive(false);
      setPomodoroTime(pomodoroDuration * 60);
    }
    // Update the ref to the current working task
    workingTaskIdRef.current = currentWorkingTaskId;
    // In the effect, update workingTaskIdRef.current = todayTasks[0]?._id;
    // If pomodoroActive and workingTaskIdRef.current is set and not found in todayTasks, reset

    // finish effect
  }, [todayTasks, pomodoroActive, pomodoroDuration]);

  // Error messages for quick add inputs
  const titleError =
    quickAddValue.trim() &&
    !isValidTitle(quickAddValue.replace(/#\w+/g, "").trim())
      ? "Title must be at least 2 characters and cannot start with a number. Numbers are allowed elsewhere."
      : "";

  const descError =
    quickAddDescription.trim() &&
    !isValidDescription(quickAddDescription.trim())
      ? "Description must be at least 5 characters and cannot start with a number. Numbers are allowed elsewhere."
      : "";

  // Optional: Fade-in style for error messages
  const errorFadeStyle: React.CSSProperties = {
    transition: "opacity 0.3s",
    opacity: 1,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Task Reminder Notification Popup */}
      {activeNotification && (
        <div className="fixed top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-primary shadow-2xl rounded-2xl px-8 py-6 flex flex-col items-center animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#2563eb" d="M12 2a6 6 0 0 0-6 6v4.586l-.707.707A1 1 0 0 0 6 16h12a1 1 0 0 0 .707-1.707L18 12.586V8a6 6 0 0 0-6-6Zm0 20a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Z"/></svg>
            <span className="text-xl font-bold text-primary">Task Reminder</span>
          </div>
          <div className="text-lg font-semibold mb-2">{activeNotification.title}</div>
          <div className="text-sm text-muted-foreground mb-4">It's time for your scheduled task!</div>
          <button
            className="mt-2 px-4 py-2 rounded bg-primary text-white font-medium shadow cursor-pointer hover:bg-primary/80 transition"
            onClick={() => {
              dismissedNotificationsRef.current.add(`${activeNotification.id}_${activeNotification.time}`);
              setActiveNotification(null);
            }}
          >
            Dismiss
          </button>
        </div>
      )}
      {/* Alarm sound for notification */}
      <audio
        ref={alarmAudioRef}
        src="/sound.mp3"
        preload="auto"
      />
      {/* Quick Add Section */}
      {/* Quick Add Section with blink animation */}
      <style>{blinkStyle}</style>
      {/* SVG filter for wavy border */}
      <svg width="0" height="0">
        <filter id="wavy-border">
          <feTurbulence
            id="turb"
            baseFrequency="0.025 0.05"
            numOctaves="2"
            result="turb"
            seed="2"
          />
          <feDisplacementMap
            in2="turb"
            in="SourceGraphic"
            scale="2.2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <Card
        style={blinkQuickAdd ? { filter: "url(#wavy-border)" } : {}}
        className={`bg-card border-border shadow-sm ${
          blinkQuickAdd
            ? "animate-[blink-quickadd_0.6s_cubic-bezier(0.4,0.0,0.2,1)_0s_2] border border-[#D86D38]"
            : ""
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-primary" />
            <span>Quick Add</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <div className="flex flex-col flex-1">
            <Input
              value={quickAddValue}
              onChange={(e) => setQuickAddValue(e.target.value)}
              placeholder="Task Title"
              className="text-base bg-background border-border focus:border-primary transition-colors placeholder:text-muted-foreground"
              onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
            />
            {titleError && (
              <span
                className="text-xs text-red-600 mt-2 ml-2 font-light block"
                style={errorFadeStyle}
              >
                {titleError}
              </span>
            )}
          </div>
          <div className="flex flex-col flex-1">
            <Input
              value={quickAddDescription}
              onChange={(e) => setQuickAddDescription(e.target.value)}
              placeholder="Description"
              className="text-base bg-background border-border focus:border-primary transition-colors placeholder:text-muted-foreground"
              onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
            />
            {descError && (
              <span
                className="text-xs text-red-600 mt-2 ml-2 font-light block"
                style={errorFadeStyle}
              >
                {descError}
              </span>
            )}
          </div>
          <div className="flex flex-col flex-1 min-w-[120px] max-w-[120px]">
            <Select value={quickAddTag} onValueChange={setQuickAddTag}>
              <SelectTrigger className="w-full h-10 text-xs">
                <SelectValue placeholder="#Tag" />
              </SelectTrigger>
              <SelectContent>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>{`#${tag}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={quickAddTag ? `#${quickAddTag.replace(/^#/, "")}` : ""}
              onChange={(e) => {
                // Always keep # at the start, but store value without #
                const val = e.target.value.startsWith("#") ? e.target.value.slice(1) : e.target.value;
                setQuickAddTag(val);
              }}
              placeholder="Add new #tag"
              className="text-xs mt-1 bg-background border-border focus:border-primary transition-colors placeholder:text-muted-foreground h-8 px-2"
              onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
              style={{ maxWidth: 120 }}
            />
          </div>
          <Select value={quickAddPriority} onValueChange={setQuickAddPriority}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleQuickAdd}
            disabled={
              quickAddStatus === 'loading' ||
              !isValidTitle(quickAddValue.replace(/#\w+/g, "").trim()) ||
              !isValidDescription(quickAddDescription.trim()) ||
              !quickAddPriority ||
              !quickAddTag.trim()
            }
            className="cursor-pointer flex items-center gap-2 min-w-[70px]"
          >
            {quickAddStatus === 'loading'
              ? (<span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>)
              : quickAddStatus === 'added' ? 'Added' : 'Add'}
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
            deleteTask={deleteTask}
            setTasks={setTasks}
            emailTime={emailTime}
            setEmailTime={setEmailTime}
          />

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
            editDescription={editDescription}
            setEditDescription={setEditDescription}
            saveEditTask={saveEditTask}
            cancelEditTask={cancelEditTask}
            showUndo={showUndo}
            deletedTask={deletedTask}
            handleUndo={handleUndo}
            setTasks={setTasks}
            emailTime={emailTime}
            setEmailTime={setEmailTime}
          />
          <TaskSection
            title="Completed"
            color="text-muted-foreground"
            icon={<CheckCircle2 className="w-5 h-5" />}
            tasks={completedTasks}
            deleteTask={deleteTask}
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
                // Notify heatmap/activity listeners
                window.dispatchEvent(new Event("activityChanged"));
              } catch (error) {
                console.error("Failed to reopen task", error);
              }
              setLoading(false);
            }}
            setTasks={setTasks}
            emailTime={emailTime}
            setEmailTime={setEmailTime}
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
                disabled={noteLoading}
              />
              <div className="flex items-center gap-2 mt-2 cursor-pointer">
                <Button onClick={handleSaveNote} disabled={noteLoading}>
                  {noteLoading ? "Saving..." : "Save"}
                </Button>
                {noteSaved && (
                  <span className="text-green-600 text-sm">Saved!</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pomodoro Timer */}
          <PomodoroTimer
            pomodoroActive={pomodoroActive}
            setPomodoroActive={setPomodoroActive}
            pomodoroTime={pomodoroTime}
            setPomodoroTime={setPomodoroTime}
            formatTime={formatTime}
            reset={() => {
              setPomodoroActive(false);
              setPomodoroTime(pomodoroDuration * 60);
            }}
            currentTask={todayTasks[0]?.title}
            pomodoroCycles={pomodoroCycles}
            audioRef={audioRef}
            pomodoroDuration={pomodoroDuration}
            setPomodoroDuration={handleDurationChange}
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
                    disabled={moodLoading}
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
                disabled={moodLoading}
              />
              <Button
                onClick={() => saveMood(mood, moodNote)}
                disabled={moodLoading}
                className="cursor-pointer"
                variant="outline"
                size="sm"
              >
                {moodLoading ? "Saving..." : moodSaved ? "Saved!" : "Save Mood"}
              </Button>
              {moodHistory.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-muted-foreground mb-2">
                    Last 7 days:
                  </div>
                  <div className="flex gap-2 justify-center">
                    {moodHistory.slice(0, 7).map((m, idx) => (
                      <span key={idx} title={m.date} className="text-xl">
                        {moodEmojis[m.mood + 2]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PomodoroTimer({
  pomodoroActive,
  setPomodoroActive,
  pomodoroTime,
  setPomodoroTime,
  formatTime,
  reset,
  currentTask,
  pomodoroCycles,
  audioRef,
  pomodoroDuration,
  setPomodoroDuration,
}: {
  pomodoroActive: boolean;
  setPomodoroActive: (val: boolean) => void;
  pomodoroTime: number;
  setPomodoroTime: (val: number) => void;
  formatTime: (s: number) => string;
  reset: () => void;
  currentTask?: string;
  pomodoroCycles: number;
  audioRef: React.RefObject<HTMLAudioElement>;
  pomodoroDuration: number;
  setPomodoroDuration: (val: number) => void;
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
        <div className="flex justify-center items-center gap-2 mb-2">
          <label
            htmlFor="pomodoro-duration"
            className="text-sm text-muted-foreground"
          >
            Set timer:
          </label>
          <select
            id="pomodoro-duration"
            value={pomodoroDuration}
            onChange={(e) => setPomodoroDuration(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
            disabled={pomodoroActive}
          >
            {[15, 20, 25, 30, 45, 50, 60].map((min) => (
              <option key={min} value={min}>
                {min} min
              </option>
            ))}
          </select>
        </div>
        <div className="text-4xl font-mono font-bold text-primary">
          {formatTime(pomodoroTime)}
        </div>
        <div className="flex justify-center space-x-2">
          <Button
            className="cursor-pointer"
            variant={pomodoroActive ? "secondary" : "default"}
            size="sm"
            onClick={() => {
              if (pomodoroActive) {
                // Pause only
                setPomodoroActive(false);
              } else {
                // Start: only reset if timer is at zero
                if (pomodoroTime === 0) {
                  setPomodoroTime(pomodoroDuration * 60);
                }
                setPomodoroActive(true);
              }
            }}
          >
            {pomodoroActive ? (
              <>
                <Pause className="w-4 h-4 mr-2 cursor-pointer" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2 cursor-pointer" /> Start
              </>
            )}
          </Button>
          <Button
            className="cursor-pointer"
            variant="outline"
            size="sm"
            onClick={reset}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {currentTask ? `Working on: ${currentTask}` : "No active task"}
        </p>
        <p className="text-xs text-muted-foreground">
          Pomodoro cycles: {pomodoroCycles}
        </p>
        <audio
          ref={audioRef}
          src="https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b2b2.mp3"
          preload="auto"
        />
      </CardContent>
    </Card>
  );
}


// Helper to format time as 12-hour with AM/PM
function formatTime12(time: string) {
  if (!time) return "";
  const [hour, minute] = time.split(":");
  let h = parseInt(hour, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${minute} ${ampm}`;
}
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
  editDescription,
  setEditDescription,
  saveEditTask,
  cancelEditTask,
  showUndo,
  deletedTask,
  handleUndo,
  onReopen,
  allTags = [],
  editTag,
  setEditTag,
  editPriority,
  setEditPriority,
  emailTime,
  setEmailTime,
}: any) {
  // Show newest tasks at the top
  const orderedTasks = [...tasks].reverse();
  // Email notification state
  const [showEmailPicker, setShowEmailPicker] = useState<string | null>(null);
  // Use emailTime from parent props
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSaved, setEmailSaved] = useState<{ [key: string]: boolean }>({});

  // Handler to save notification time (stub API)
  const handleSetEmailNotification = async (taskId: string) => {
    setEmailLoading(true);
    // Save notificationTime to backend
    try {
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: taskId, notificationTime: emailTime[taskId] })
      });
    } catch (err) {}
    setEmailLoading(false);
    setEmailSaved(prev => ({ ...prev, [taskId]: true }));
    setTimeout(() => {
      setEmailSaved(prev => ({ ...prev, [taskId]: false }));
      setShowEmailPicker(null);
    }, 1200);
  };

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
        {orderedTasks.length === 0 ? (
          <div className="text-muted-foreground">
            No {title.toLowerCase()} tasks
          </div>
        ) : (
          orderedTasks.map((task: Task) => (
            <div
              key={task._id}
              className={`flex items-center space-x-3 p-3 rounded-xl border relative z-10 shadow-sm ${
                title === "Completed"
                  ? "bg-muted/40 border border-border text-muted-foreground opacity-70"
                  : "bg-accent/30 border border-border"
              }`}
            >
              {completeTask && title !== "Completed" && (
                <button
                  type="button"
                  onClick={() => completeTask(task._id ?? "")}
                  className="focus:outline-none cursor-pointer"
                  title="Complete task"
                >
                  {title === "Overdue" ? (
                    <Clock className="w-5 h-5 text-destructive" />
                  ) : (
                    <Circle className="w-5 h-5 text-primary" />
                  )}
                </button>
              )}
              {onReopen && title === "Completed" && (
                <button
                  type="button"
                  className="focus:outline-none cursor-pointer"
                  onClick={() => onReopen(task._id ?? "")}
                  title="Reopen task"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </button>
              )}
              <div className="flex-1">
                {editingTaskId === task._id && title !== "Completed" ? (
                  <div className="flex flex-col gap-2 items-start">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="mb-1"
                    />
                    <Input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description"
                      className="mb-1 text-xs"
                    />
                    <div className="flex gap-2 w-full">
                      <Select value={editTag} onValueChange={setEditTag}>
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <SelectValue placeholder="#Tag" />
                        </SelectTrigger>
                        <SelectContent>
                          {allTags.map((tag: string) => (
                            <SelectItem key={tag} value={tag}>{`#${tag}`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={editTag ? `#${editTag.replace(/^#/, "")}` : ""}
                        onChange={(e) => {
                          const val = e.target.value.startsWith("#") ? e.target.value.slice(1) : e.target.value;
                          setEditTag(val);
                        }}
                        placeholder="Add new #tag"
                        className="text-xs h-8 px-2"
                        style={{ maxWidth: 90 }}
                      />
                      <Select value={editPriority} onValueChange={setEditPriority}>
                        <SelectTrigger className="w-20 h-8 text-xs">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => saveEditTask(task._id ?? "")}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditTask}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center">
                      <p
                        className={`font-medium ${
                          title === "Completed"
                            ? "line-through"
                            : "text-foreground"
                        }`}
                      >
                        {task.title}
                      </p>
                      {/* Add extra margin between title and button */}
                      {title === "Today" && (
                        <div className="ml-6 flex items-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowEmailPicker(task._id ?? "")}
                            className="flex items-center gap-1 px-2 py-1 h-7 cursor-pointer"
                            title={emailTime[task._id ?? ""] ? `Notification set for ${formatTime12(emailTime[task._id ?? ""])} ` : "Notify Me"}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a6 6 0 0 0-6 6v4.586l-.707.707A1 1 0 0 0 6 16h12a1 1 0 0 0 .707-1.707L18 12.586V8a6 6 0 0 0-6-6Zm0 20a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Z"/></svg>
                            <span className="text-xs">
                              {emailTime[task._id ?? ""] ? formatTime12(emailTime[task._id ?? ""]) : "Notify Me"}
                            </span>
                          </Button>
                        </div>
                      )}
                    </div>
                    {/* Centered Popup for Time Picker, no overlay */}
                    {showEmailPicker === task._id && (
                      <div style={{position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999}}>
                        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center min-w-[260px] border border-border">
                          <h3 className="text-base font-semibold mb-4">Set Notification Time</h3>
                          <input
                            type="time"
                            value={emailTime[task._id ?? ""] || ""}
                            onChange={e => setEmailTime((prev: { [key: string]: string }) => ({ ...prev, [task._id ?? ""]: e.target.value }))}
                            className="border rounded px-2 py-1 text-sm mb-4 w-full"
                            required
                            placeholder="Select time"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              disabled={emailLoading || !(emailTime[task._id ?? ""])}
                              onClick={() => handleSetEmailNotification(task._id ?? "")}
                              className="cursor-pointer"
                            >
                              {emailLoading ? "Saving..." : emailSaved[task._id ?? ""] ? "Saved!" : "Save"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowEmailPicker(null)}
                              className="cursor-pointer"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                    {task.tag && (
                      <p className="text-sm text-muted-foreground">
                        #{task.tag}
                      </p>
                    )}
                  </>
                )}
              </div>
              {task.priority && title !== "Completed" && (
                <Badge variant="destructive" className="text-xs">
                  {task.priority}
                </Badge>
              )}
              {/* Three-dot menu for Overdue and Completed tasks */}
              {deleteTask && (title === "Completed" || title === "Overdue") && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="focus:outline-none bg-transparent p-1 rounded hover:bg-muted cursor-pointer"
                      title="More options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => deleteTask(task._id ?? "")}
                      className="cursor-pointer"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {startEditTask && deleteTask && title !== "Completed" && title !== "Overdue" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="focus:outline-none bg-transparent p-1 rounded hover:bg-muted cursor-pointer"
                      title="More options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => startEditTask(task)}
                      className="cursor-pointer"
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteTask(task._id ?? "")}
                      className="cursor-pointer"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))
        )}
        {showUndo &&
          deletedTask &&
          ((title === "Completed" && deletedTask.status === "completed") ||
            (title === "Today" && deletedTask.status === "today") ||
            (title === "Overdue" && deletedTask.status === "overdue")) && (
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
