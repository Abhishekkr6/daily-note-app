"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Plus,
  Search,
  Clock,
  Briefcase,
  Heart,
  GraduationCap,
  Home,
  Zap,
  Copy,
  Edit,
  Trash2,
  Star,
} from "lucide-react"

interface Template {
  id: string
  name: string
  description: string
  category: "task" | "note"
  type: "work" | "personal" | "health" | "learning" | "general"
  content: string
  tags: string[]
  isStarred: boolean
  usageCount: number
}

const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Daily Standup",
    description: "Template for daily team standup meetings",
    category: "note",
    type: "work",
    content:
      "## Daily Standup - {date}\n\n### What I did yesterday:\n- \n\n### What I'm doing today:\n- \n\n### Blockers:\n- ",
    tags: ["meeting", "standup", "team"],
    isStarred: true,
    usageCount: 45,
  },
  {
    id: "2",
    name: "Weekly Review",
    description: "Reflect on the week's accomplishments and plan ahead",
    category: "note",
    type: "personal",
    content:
      "## Weekly Review - Week of {date}\n\n### Wins this week:\n- \n\n### Challenges:\n- \n\n### Lessons learned:\n- \n\n### Next week's focus:\n- ",
    tags: ["review", "reflection", "planning"],
    isStarred: true,
    usageCount: 23,
  },
  {
    id: "3",
    name: "Project Kickoff",
    description: "Template for starting new projects",
    category: "task",
    type: "work",
    content:
      "Set up project repository\nDefine project requirements\nCreate project timeline\nAssign team roles\nSchedule kickoff meeting",
    tags: ["project", "planning", "kickoff"],
    isStarred: false,
    usageCount: 12,
  },
  {
    id: "4",
    name: "Morning Routine",
    description: "Daily morning routine checklist",
    category: "task",
    type: "personal",
    content:
      "Morning meditation (10 min)\nReview daily goals\nCheck calendar\nPrioritize top 3 tasks\nHealthy breakfast",
    tags: ["routine", "morning", "wellness"],
    isStarred: true,
    usageCount: 67,
  },
  {
    id: "5",
    name: "Learning Session",
    description: "Structure for focused learning sessions",
    category: "note",
    type: "learning",
    content:
      "## Learning Session - {topic}\n\n### Objective:\n\n### Key concepts:\n- \n\n### Practice exercises:\n- \n\n### Questions/Follow-up:\n- \n\n### Next steps:\n- ",
    tags: ["learning", "study", "notes"],
    isStarred: false,
    usageCount: 18,
  },
]

export function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter
    const matchesType = typeFilter === "all" || template.type === typeFilter

    return matchesSearch && matchesCategory && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "work":
        return <Briefcase className="w-4 h-4" />
      case "personal":
        return <Home className="w-4 h-4" />
      case "health":
        return <Heart className="w-4 h-4" />
      case "learning":
        return <GraduationCap className="w-4 h-4" />
      default:
        return <Zap className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "work":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "personal":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "health":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "learning":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const handleUseTemplate = (template: Template) => {
    // Mock usage - in real app, this would create a new task or note
    setTemplates(templates.map((t) => (t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t)))
  }

  const toggleStar = (templateId: string) => {
    setTemplates(templates.map((t) => (t.id === templateId ? { ...t, isStarred: !t.isStarred } : t)))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Templates</h1>
          <p className="text-muted-foreground">Reusable templates for tasks and notes</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input placeholder="Enter template name..." />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Brief description..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task">Task Template</SelectItem>
                      <SelectItem value="note">Note Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea placeholder="Template content..." rows={6} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateDialog(false)}>Create Template</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="task">Tasks</SelectItem>
                  <SelectItem value="note">Notes</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg border ${getTypeColor(template.type)}`}>
                    {getTypeIcon(template.type)}
                  </div>
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge variant="outline" className="text-xs mt-1">
                      {template.category}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleStar(template.id)}
                  className={template.isStarred ? "text-amber-500" : "text-muted-foreground"}
                >
                  <Star className={`w-4 h-4 ${template.isStarred ? "fill-current" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{template.description}</p>

              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Used {template.usageCount} times</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" onClick={() => handleUseTemplate(template)} className="flex-1">
                  <Copy className="w-3 h-3 mr-1" />
                  Use Template
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive bg-transparent">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search or create a new template</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      )}
    </div>
  )
}
