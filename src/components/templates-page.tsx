// IMPORTANT: This file uses default export.
// Import it using: import TemplatesPage from "@/components/templates-page";
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";

// Template type definition
interface Template {
  id: string;
  name: string;
  description: string;
  category: "task" | "note";
  type: "work" | "personal" | "health" | "learning" | "general";
  content: string;
  tags: string[];
  isStarred: boolean;
  usageCount: number;
}

const fetchTemplates = async (): Promise<Template[]> => {
  // TODO: Fetch templates from API or database
  return [];
};

function TemplatesPage() {
  const router = useRouter();
  // State for templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // State for new template form
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<string>("");
  const [newType, setNewType] = useState<string>("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState<string>(""); // comma separated

  // State for edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState<string>("");
  const [editType, setEditType] = useState<string>("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState<string>("");

  // Fetch templates from API on mount
  React.useEffect(() => {
    fetch("/api/template")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTemplates(data);
      })
      .catch(() => { });
  }, []);

  // Filter logic
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      categoryFilter === "all" || template.category === categoryFilter;
    const matchesType = typeFilter === "all" || template.type === typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  // Icon logic
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "work":
        return <Briefcase className="w-4 h-4" />;
      case "personal":
        return <Home className="w-4 h-4" />;
      case "health":
        return <Heart className="w-4 h-4" />;
      case "learning":
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  // Color logic
  const getTypeColor = (type: string) => {
    switch (type) {
      case "work":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "personal":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "health":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "learning":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  // Use template logic
  const handleUseTemplate = async (template: any) => {
    // 1. Create a new task using template data
    const taskPayload = {
      title: template.name,
      description: template.description || template.content,
      tag:
        template.tags && template.tags.length > 0
          ? template.tags[0]
          : undefined,
      priority: "Medium",
      status: "today",
    };
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskPayload),
      });
    } catch (err) { }

    // 2. Increment usageCount in backend and UI
    const payload = {
      id: template._id,
      name: template.name,
      description: template.description,
      category: template.category,
      type: template.type,
      content: template.content,
      tags: template.tags,
      isStarred: template.isStarred,
      usageCount: (template.usageCount || 0) + 1,
    };
    try {
      const res = await fetch("/api/template", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data && data._id) {
        setTemplates((prev) =>
          prev.map((t) => ((t as any)._id === data._id ? data : t))
        );
      }
    } catch (err) { }

    // 3. Redirect to /home page (today section)
    router.push("/home");
  };
  // (Removed duplicate block that referenced undefined 'template')

  // Star/unstar logic
  const toggleStar = async (templateId: string) => {
    const template = templates.find((t) => (t as any)._id === templateId);
    if (!template) return;
    const payload = {
      id: templateId,
      name: template.name,
      description: template.description,
      category: template.category,
      type: template.type,
      content: template.content,
      tags: template.tags,
      isStarred: !template.isStarred,
      usageCount: template.usageCount,
    };
    try {
      const res = await fetch("/api/template", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data && data._id) {
        setTemplates((prev) =>
          prev.map((t) => ((t as any)._id === data._id ? data : t))
        );
      }
    } catch (err) { }
  };

  // Edit template logic
  const handleEditTemplate = (template: any) => {
    setEditTemplate(template);
    setEditName(template.name);
    setEditDescription(template.description);
    setEditCategory(template.category);
    setEditType(template.type);
    setEditContent(template.content);
    setEditTags((template.tags || []).join(", "));
    setEditDialogOpen(true);
  };

  // Save edited template
  const handleSaveEdit = async () => {
    if (!editTemplate) return;
    const payload = {
      id: editTemplate._id,
      name: editName,
      description: editDescription,
      category: editCategory,
      type: editType,
      content: editContent,
      tags: editTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isStarred: editTemplate.isStarred,
      usageCount: editTemplate.usageCount,
    };
    try {
      const res = await fetch("/api/template", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data && data._id) {
        setTemplates((prev) =>
          prev.map((t) => ((t as any)._id === data._id ? data : t))
        );
      }
    } catch (err) { }
    setEditDialogOpen(false);
    setEditTemplate(null);
  };

  // Delete template logic with undo
  const handleDeleteTemplate = async (templateId: string) => {
    // Always use _id for backend and UI operations
    const deletedTemplate = templates.find(
      (t) => (t as any)._id === templateId
    );
    if (!deletedTemplate) return;
    // Remove only the clicked template from UI
    setTemplates((prev) => prev.filter((t) => (t as any)._id !== templateId));

    // Show undo toast for this template only
    let undo = false;
    let toastId: string | number | undefined = undefined;
    const UndoToast = () => (
      <div className="flex items-center gap-2">
        <span>
          Template{" "}
          <span style={{ color: "#ef4444", fontWeight: "bold" }}>
            &quot;{deletedTemplate.name}&quot;
          </span>{" "}
          deleted
        </span>
        <button
          className="text-blue-600 underline ml-2"
          onClick={() => {
            undo = true;
            setTemplates((prev) => {
              // Prevent duplicate on undo
              if (!prev.some((t) => (t as any)._id === templateId)) {
                return [deletedTemplate, ...prev];
              }
              return prev;
            });
            if (toastId !== undefined) toast.dismiss(toastId);
          }}
        >
          Undo
        </button>
      </div>
    );
    toastId = toast(<UndoToast />, { duration: 5000 });

    // Wait for undo window
    setTimeout(async () => {
      if (!undo) {
        // Delete from backend
        await fetch(`/api/template?id=${templateId}`, { method: "DELETE" });
      }
    }, 5000);
  };

  // Create template logic (API)
  const handleCreateTemplate = async () => {
    if (!newName || !newCategory || !newType) return;
    const payload = {
      name: newName,
      description: newDescription,
      category: newCategory,
      type: newType,
      content: newContent,
      tags: newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isStarred: false,
      usageCount: 0,
    };
    try {
      const res = await fetch("/api/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data && data._id) {
        setTemplates((prev) => [data, ...prev]);
      }
    } catch (err) { }
    setShowCreateDialog(false);
    setNewName("");
    setNewDescription("");
    setNewCategory("");
    setNewType("");
    setNewContent("");
    setNewTags("");
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Templates</h1>
          <p className="text-sm md:text-base text-muted-foreground mr-1">
            Reusable templates for tasks and notes
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer w-full sm:w-auto">
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
                <Input
                  placeholder="Enter template name..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Brief description..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newCategory} onValueChange={setNewCategory}>
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
                  <Select value={newType} onValueChange={setNewType}>
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
                <Textarea
                  placeholder="Template content..."
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input
                  placeholder="e.g. meeting, standup, team"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate}>Create Template</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                placeholder="Enter template name..."
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Brief description..."
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
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
                <Select value={editType} onValueChange={setEditType}>
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
              <Textarea
                placeholder="Template content..."
                rows={6}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma separated)</Label>
              <Input
                placeholder="e.g. meeting, standup, team"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col gap-3">
            <div className="w-full relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm md:text-base"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="task">Tasks</SelectItem>
                  <SelectItem value="note">Notes</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-32">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredTemplates.map((template) => (
          <Card
            key={(template as any)._id || template.id}
            className="bg-card border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={`p-2 rounded-lg border ${getTypeColor(
                      template.type
                    )}`}
                  >
                    {getTypeIcon(template.type)}
                  </div>
                  <div className="overflow-hidden">
                    <CardTitle className="text-base truncate pr-2">{template.name}</CardTitle>\r
                    <Badge variant="outline" className="text-xs mt-1">
                      {template.category}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    toggleStar((template as any)._id || template.id)
                  }
                  className={(template.isStarred ? "text-amber-500" : "text-muted-foreground") + " cursor-pointer"}
                >
                  <Star className={`w-4 h-4 ${template.isStarred ? "fill-current" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>

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
                <Button
                  size="sm"
                  onClick={() => handleUseTemplate(template)}
                  className="flex-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Use Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditTemplate(template)}
                  className="cursor-pointer"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive bg-transparent cursor-pointer"
                  onClick={() => handleDeleteTemplate((template as any)._id)}
                >
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
          <h3 className="text-lg font-medium text-foreground mb-2">
            No templates found
          </h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or create a new template
          </p>
          <Button onClick={() => setShowCreateDialog(true)} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      )}
    </div>
  );
}

export default TemplatesPage;
