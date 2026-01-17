"use client";

import { useState, useEffect, useRef } from "react";
import ConfirmDialog from "@/components/confirm-dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner"; // If you use a toast library, otherwise use alert
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Tag,
  Trash2,
  Edit,
  Copy,
  Archive,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "completed";
  tags: string[];
  dueDate?: string;
  createdAt: string;
}

// ...existing code...

function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  useEffect(() => {
    const highlightId = searchParams.get("highlight");
    if (highlightId) {
      setActiveHighlight(highlightId);
      const timeout = setTimeout(() => setActiveHighlight(null), 1600);
      return () => clearTimeout(timeout);
    }
  }, [searchParams]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchDate, setSearchDate] = useState<string>("");
  // Fetch tasks from backend on mount
  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("/api/tasks", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data = await res.json();
        // Map backend _id to id for frontend
        setTasks(
          data.map((t: any) => ({
            id: t._id,
            title: t.title,
            description: t.description,
            // Map priority to backend enum
            priority: t.priority || "Low",
            // Map status to backend enum
            status: t.status,
            tags: t.tag ? [t.tag] : [],
            dueDate: t.dueDate,
            createdAt: t.createdAt,
          }))
        );
      } catch (err) {
        setError("Could not load tasks");
      }
    }
    fetchTasks();
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const [recentlyDeleted, setRecentlyDeleted] = useState<Task[] | null>(null);
  const recentlyDeletedRef = useRef<Task[] | null>(null);
  const undoTimeout = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState(false);

  // Get unique tags from all tasks
  const allTags = Array.from(new Set(tasks.flatMap((task) => task.tags)));

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    // Compare priority exactly as backend and dropdown values ('Low', 'Medium', 'High')
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;
    const matchesTag = tagFilter === "all" || task.tags.includes(tagFilter);

    // Date filter: match if searchDate is empty or matches the task's dueDate (YYYY-MM-DD)
    const matchesDate = !searchDate || (task.dueDate && task.dueDate.startsWith(searchDate));

    return matchesSearch && matchesStatus && matchesPriority && matchesTag && matchesDate;
  });

  // Mark as completed with backend update
  const handleTaskToggle = async (taskId: string) => {
    setLoadingTaskId(taskId);
    setError("");
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    // Only toggle between "completed" and "today" (backend expects "today" not "todo")
    const newStatus = task.status === "completed" ? "today" : "completed";
    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ _id: taskId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const updated = await res.json();
      setTasks(
        tasks.map((t) =>
          t.id === taskId ? { ...t, status: updated.status } : t
        )
      );
      if (typeof toast === "function") toast("Task updated successfully");
      // Dispatch event for heatmap realtime update
      window.dispatchEvent(new Event("activityChanged"));
    } catch (err: any) {
      setError(err.message || "Error updating task");
      if (typeof toast === "function")
        toast("Error updating task", { description: err.message });
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks([...selectedTasks, taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter((id) => id !== taskId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(filteredTasks.map((task) => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  // Bulk complete with backend update
  const handleBulkComplete = async () => {
    setError("");
    for (const taskId of selectedTasks) {
      await handleTaskToggle(taskId);
    }
    setSelectedTasks([]);
  };

  const handleBulkDelete = () => {
    // Find and store deleted tasks
    const deleted = tasks.filter((task) => selectedTasks.includes(task.id));
    setRecentlyDeleted(deleted);
    recentlyDeletedRef.current = deleted;
    setTasks(tasks.filter((task) => !selectedTasks.includes(task.id)));
    setSelectedTasks([]);
    // Show undo toast
    if (typeof toast === "function") {
      let toastId: string | number | undefined = undefined;
      const UndoToast = () => (
        <span>
          Deleted {deleted.length} task{deleted.length > 1 ? "s" : ""}.&nbsp;
          <button
            className="underline text-primary font-medium ml-2 cursor-pointer"
            onClick={() => {
              if (undoTimeout.current) clearTimeout(undoTimeout.current);
              setTasks((prev) => [
                ...(recentlyDeletedRef.current || []),
                ...prev,
              ]);
              setRecentlyDeleted(null);
              recentlyDeletedRef.current = null;
              if (toastId !== undefined) toast.dismiss(toastId);
            }}
          >
            Undo
          </button>
        </span>
      );
      toastId = toast(<UndoToast />, { duration: 5000 });
    }
    // After timeout, delete from backend if not undone
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
    undoTimeout.current = setTimeout(async () => {
      if (recentlyDeletedRef.current) {
        for (const task of recentlyDeletedRef.current) {
          try {
            await fetch("/api/tasks", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ _id: task.id }),
            });
          } catch { }
        }
        setRecentlyDeleted(null);
        recentlyDeletedRef.current = null;
        // Notify other tabs/pages
        window.dispatchEvent(new Event("activityChanged"));
      }
    }, 5000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "overdue":
        return <Clock className="w-4 h-4 text-destructive" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-primary/20 text-primary-foreground px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Tasks</h1>
          <p className="text-muted-foreground">
            {filteredTasks.length} of {tasks.length} tasks
          </p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer w-full sm:w-auto"
          onClick={() => {
            if (typeof window !== "undefined") {
              sessionStorage.setItem("quickAddBlink", "true");
            }
            router.push("/home");
          }}
        >
          <Circle className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks, descriptions, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] flex-grow sm:flex-grow-0">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="today">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px] flex-grow sm:flex-grow-0">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="w-[140px] flex-grow sm:flex-grow-0">
                  <SelectValue placeholder="Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      #{tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date filter */}
              <input
                type="date"
                value={searchDate}
                onChange={e => setSearchDate(e.target.value)}
                className="border rounded px-2 py-1 min-w-[140px] flex-grow sm:flex-grow-0"
                placeholder="Filter by date"
                title="Filter tasks by date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {selectedTasks.length} task{selectedTasks.length > 1 ? "s" : ""}{" "}
                selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkComplete}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfirm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <ConfirmDialog
                  open={showConfirm}
                  message={`Are you sure you want to delete the selected tasks?`}
                  onConfirm={() => {
                    setShowConfirm(false);
                    handleBulkDelete();
                  }}
                  onCancel={() => setShowConfirm(false)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-primary" />
              <span>Tasks</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={
                  selectedTasks.length === filteredTasks.length &&
                  filteredTasks.length > 0
                }
                onCheckedChange={handleSelectAll}
                className="border-2 border-[#D86D38] cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Circle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tasks found matching your criteria</p>
            </div>
          ) : (
            filteredTasks.map((task, idx) => (
              <div
                key={task.id}
                className={`flex items-center space-x-3 p-4 rounded-xl border transition-all hover:shadow-md ${task.status === "completed"
                  ? "bg-muted/20 opacity-60"
                  : "bg-background border-border hover:border-primary/30"
                  } ${activeHighlight && activeHighlight === String(task.id) ? "animate-blink" : ""}`}
              >
                {/* Selection Checkbox */}
                <Checkbox
                  checked={selectedTasks.includes(task.id)}
                  onCheckedChange={(checked) =>
                    handleSelectTask(task.id, checked as boolean)
                  }
                  className="border-2 border-[#D86D38] cursor-pointer"
                />

                {/* Status Icon */}
                <button
                  onClick={() => handleTaskToggle(task.id)}
                  className="hover:scale-110 transition-transform cursor-pointer"
                >
                  {getStatusIcon(task.status)}
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3
                      className={`font-medium text-foreground ${task.status === "completed" ? "line-through" : ""
                        }`}
                    >
                      {highlightText(task.title, searchQuery)}
                    </h3>
                    <Badge
                      variant={getPriorityColor(task.priority)}
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                  </div>

                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {highlightText(task.description, searchQuery)}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                    {task.dueDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-1">
                      <Tag className="w-3 h-3" />
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag) => (
                          <span key={tag} className="text-primary">
                            #{highlightText(tag, searchQuery)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label="Open task menu"
                      type="button"
                      className="p-1 rounded hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        // Remove from UI and show undo toast
                        setTasks(tasks.filter((t) => t.id !== task.id));
                        setRecentlyDeleted([task]);
                        recentlyDeletedRef.current = [task];
                        if (typeof toast === "function") {
                          let toastId: string | number | undefined = undefined;
                          const UndoToast = () => (
                            <span>
                              Task deleted.&nbsp;
                              <button
                                className="underline text-primary font-medium ml-2 cursor-pointer"
                                onClick={() => {
                                  if (undoTimeout.current)
                                    clearTimeout(undoTimeout.current);
                                  setTasks((prev) => [task, ...prev]);
                                  setRecentlyDeleted(null);
                                  recentlyDeletedRef.current = null;
                                  if (toastId !== undefined)
                                    toast.dismiss(toastId);
                                }}
                              >
                                Undo
                              </button>
                            </span>
                          );
                          toastId = toast(<UndoToast />, { duration: 5000 });
                        }
                        // After timeout, delete from backend if not undone
                        if (undoTimeout.current)
                          clearTimeout(undoTimeout.current);
                        undoTimeout.current = setTimeout(async () => {
                          if (recentlyDeletedRef.current) {
                            try {
                              await fetch("/api/tasks", {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({ _id: task.id }),
                              });
                            } catch { }
                            setRecentlyDeleted(null);
                            recentlyDeletedRef.current = null;
                            // Notify other tabs/pages
                            window.dispatchEvent(new Event("activityChanged"));
                          }
                        }, 5000);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TasksPage;
