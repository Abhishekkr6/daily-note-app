"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Label } from "./ui/label"
import { CalendarIcon, Plus, X } from "lucide-react"
import { format } from "date-fns"

interface TaskDialogProps {
  trigger?: React.ReactNode
  task?: {
    id?: string
    title: string
    description?: string
    priority: "low" | "medium" | "high"
    status: "todo" | "in-progress" | "completed"
    tags: string[]
    dueDate?: string
  }
  onSave?: (task: any) => void
}

export function TaskDialog({ trigger, task, onSave }: TaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [titleError, setTitleError] = useState("");
  const [descError, setDescError] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(task?.priority || "medium")
  const [status, setStatus] = useState<"todo" | "in-progress" | "completed">(task?.status || "todo")
  const [tags, setTags] = useState<string[]>(task?.tags || [])
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.dueDate ? new Date(task.dueDate) : undefined)
  const [newTag, setNewTag] = useState("")

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Allow numbers anywhere except the first character
  const validateNoLeadingNumber = (value: string) => {
    if (!value) return true;
    return !/^[0-9]/.test(value[0] || "");
  };

  const handleSave = () => {
    let valid = true;
    if (!validateNoLeadingNumber(title.trim())) {
      setTitleError("Title cannot start with a number.");
      valid = false;
    } else {
      setTitleError("");
    }
    if (description.trim() && !validateNoLeadingNumber(description.trim())) {
      setDescError("Description cannot start with a number.");
      valid = false;
    } else {
      setDescError("");
    }
    if (!valid) return;
    const taskData = {
      id: task?.id,
      title,
      description,
      priority,
      status,
      tags,
      dueDate: dueDate?.toISOString(),
      createdAt: task?.id ? undefined : new Date().toISOString(),
    };
    onSave?.(taskData);
    setOpen(false);
    // Reset form if creating new task
    if (!task?.id) {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setStatus("todo");
      setTags([]);
      setDueDate(undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task?.id ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!validateNoLeadingNumber(e.target.value.trim())) {
                  setTitleError("Title cannot start with a number.");
                } else {
                  setTitleError("");
                }
              }}
            />
            {titleError && (
              <span className="text-xs text-red-500">{titleError}</span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add a description..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (e.target.value.trim() && !validateNoLeadingNumber(e.target.value.trim())) {
                  setDescError("Description cannot start with a number.");
                } else {
                  setDescError("");
                }
              }}
              rows={3}
            />
            {descError && (
              <span className="text-xs text-red-500">{descError}</span>
            )}
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(val) => setPriority(val as "low" | "medium" | "high") }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as "todo" | "in-progress" | "completed") }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  #{tag}
                  <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive" title="Remove tag">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              {task?.id ? "Update" : "Create"} Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
