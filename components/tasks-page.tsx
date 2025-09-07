"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
} from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string
  priority: "low" | "medium" | "high"
  status: "todo" | "in-progress" | "completed"
  tags: string[]
  dueDate?: string
  createdAt: string
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Review quarterly reports",
    description: "Go through Q3 financial reports and prepare summary",
    priority: "high",
    status: "todo",
    tags: ["work", "finance"],
    dueDate: "2024-01-15",
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    title: "Call dentist for appointment",
    description: "Schedule routine cleaning appointment",
    priority: "medium",
    status: "todo",
    tags: ["personal", "health"],
    dueDate: "2024-01-12",
    createdAt: "2024-01-08",
  },
  {
    id: "3",
    title: "Prepare presentation slides",
    description: "Create slides for Monday's client meeting",
    priority: "high",
    status: "in-progress",
    tags: ["work", "presentation"],
    dueDate: "2024-01-16",
    createdAt: "2024-01-11",
  },
  {
    id: "4",
    title: "Buy groceries",
    priority: "low",
    status: "todo",
    tags: ["personal", "shopping"],
    dueDate: "2024-01-16",
    createdAt: "2024-01-15",
  },
  {
    id: "5",
    title: "Read chapter 5",
    description: "Continue reading 'Atomic Habits'",
    priority: "medium",
    status: "todo",
    tags: ["learning", "books"],
    dueDate: "2024-01-16",
    createdAt: "2024-01-14",
  },
  {
    id: "6",
    title: "Morning workout",
    priority: "medium",
    status: "completed",
    tags: ["health", "fitness"],
    createdAt: "2024-01-15",
  },
  {
    id: "7",
    title: "Check emails",
    priority: "low",
    status: "completed",
    tags: ["work", "communication"],
    createdAt: "2024-01-15",
  },
]

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [tagFilter, setTagFilter] = useState<string>("all")
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])

  // Get unique tags from all tasks
  const allTags = Array.from(new Set(tasks.flatMap((task) => task.tags)))

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    const matchesTag = tagFilter === "all" || task.tags.includes(tagFilter)

    return matchesSearch && matchesStatus && matchesPriority && matchesTag
  })

  const handleTaskToggle = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: task.status === "completed" ? "todo" : "completed" } : task,
      ),
    )
  }

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks([...selectedTasks, taskId])
    } else {
      setSelectedTasks(selectedTasks.filter((id) => id !== taskId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(filteredTasks.map((task) => task.id))
    } else {
      setSelectedTasks([])
    }
  }

  const handleBulkComplete = () => {
    setTasks(tasks.map((task) => (selectedTasks.includes(task.id) ? { ...task, status: "completed" as const } : task)))
    setSelectedTasks([])
  }

  const handleBulkDelete = () => {
    setTasks(tasks.filter((task) => !selectedTasks.includes(task.id)))
    setSelectedTasks([])
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-primary" />
      case "in-progress":
        return <Clock className="w-5 h-5 text-amber-500" />
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />
    }
  }

  const highlightText = (text: string, query: string) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, "gi")
    const parts = text.split(regex)
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-primary/20 text-primary-foreground px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Tasks</h1>
          <p className="text-muted-foreground">
            {filteredTasks.length} of {tasks.length} tasks
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
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
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="w-32">
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
                {selectedTasks.length} task{selectedTasks.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkComplete}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
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
                checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                onCheckedChange={handleSelectAll}
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
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center space-x-3 p-4 rounded-xl border transition-all hover:shadow-md ${
                  task.status === "completed"
                    ? "bg-muted/20 opacity-60"
                    : "bg-background border-border hover:border-primary/30"
                }`}
              >
                {/* Selection Checkbox */}
                <Checkbox
                  checked={selectedTasks.includes(task.id)}
                  onCheckedChange={(checked) => handleSelectTask(task.id, checked as boolean)}
                />

                {/* Status Icon */}
                <button onClick={() => handleTaskToggle(task.id)} className="hover:scale-110 transition-transform">
                  {getStatusIcon(task.status)}
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className={`font-medium text-foreground ${task.status === "completed" ? "line-through" : ""}`}>
                      {highlightText(task.title, searchQuery)}
                    </h3>
                    <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                      {task.priority}
                    </Badge>
                  </div>

                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-2">{highlightText(task.description, searchQuery)}</p>
                  )}

                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    {task.dueDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-1">
                      <Tag className="w-3 h-3" />
                      <div className="flex space-x-1">
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
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
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
  )
}
