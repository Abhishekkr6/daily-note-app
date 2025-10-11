"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Settings, User, Bell, Palette, Download, Upload, Trash2, Clock, Database } from "lucide-react"
import { Check } from "lucide-react"
import { useTheme } from "next-themes"

export function SettingsPage() {
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // Remove Photo feature and state fully removed

  // Handle image select and preview
  const handleChangePhoto = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState({
    taskReminders: true,
    dailyDigest: true,
    weeklyReport: false,
    streakAlerts: true,
    focusBreaks: true,
  })

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    timezone: "America/New_York",
    workingHours: { start: "09:00", end: "17:00" },
  })

  const [preferences, setPreferences] = useState({
    defaultTaskPriority: "medium",
    pomodoroLength: 25,
    shortBreak: 5,
    longBreak: 15,
    autoArchive: 30,
    weekStartsOn: "monday",
  })

  // Fetch user profile from API
  React.useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/users/profile", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setProfile((prev) => ({
            ...prev,
            name: data.name || "",
            email: data.email || "",
          }));
          if (data.avatarUrl) {
            setAvatarUrl(data.avatarUrl);
          } else {
            setAvatarUrl(null);
          }
        }
      } catch (err) {
        // handle error (optional)
      }
    }
    fetchProfile();
  }, []);

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
  }

  const handleExportData = () => {
    // Mock export functionality
    const data = {
      tasks: [],
      notes: [],
      settings: { notifications, profile, preferences },
      exportDate: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dailynote-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Menu */}
        <div>
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-primary" />
                <span>Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start cursor-pointer">
                <User className="w-4 h-4 mr-3" />
                Profile
              </Button>
              <Button variant="ghost" className="w-full justify-start cursor-pointer">
                <Palette className="w-4 h-4 mr-3" />
                Appearance
              </Button>
              <Button variant="ghost" className="w-full justify-start cursor-pointer">
                <Bell className="w-4 h-4 mr-3" />
                Notifications
              </Button>
              <Button variant="ghost" className="w-full justify-start cursor-pointer">
                <Clock className="w-4 h-4 mr-3" />
                Preferences
              </Button>
              <Button variant="ghost" className="w-full justify-start cursor-pointer">
                <Database className="w-4 h-4 mr-3" />
                Data & Privacy
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-primary" />
                <span>Profile Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  {selectedFile ? (
                    <AvatarImage src={avatarUrl || ""} alt="Profile" />
                  ) : avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Profile" />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {profile.name
                        ? profile.name[0].toUpperCase()
                        : profile.email
                        ? profile.email[0].toUpperCase()
                        : "?"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" onClick={handleChangePhoto} className="cursor-pointer">
                    Change Photo
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    placeholder="Select profile photo"
                    title="Select profile photo"
                  />
                  {/* Remove Photo button and state fully removed. JSX is now valid. */}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    readOnly
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={profile.timezone}
                    onValueChange={(value) => setProfile((prev) => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Working Hours</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={profile.workingHours.start}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        workingHours: { ...prev.workingHours, start: e.target.value },
                      }))
                    }
                    className="w-32"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={profile.workingHours.end}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        workingHours: { ...prev.workingHours, end: e.target.value },
                      }))
                    }
                    className="w-32"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5 text-primary" />
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Theme Preview</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border bg-background">
                    <div className="space-y-2">
                      <div className="h-2 bg-primary rounded"></div>
                      <div className="h-2 bg-muted rounded w-3/4"></div>
                      <div className="h-2 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border bg-card">
                    <div className="space-y-2">
                      <div className="h-2 bg-primary rounded"></div>
                      <div className="h-2 bg-muted rounded w-3/4"></div>
                      <div className="h-2 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border bg-accent">
                    <div className="space-y-2">
                      <div className="h-2 bg-primary rounded"></div>
                      <div className="h-2 bg-muted rounded w-3/4"></div>
                      <div className="h-2 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-primary" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get notified about upcoming task deadlines</p>
                  </div>
                  <Switch
                    checked={notifications.taskReminders}
                    onCheckedChange={(checked) => handleNotificationChange("taskReminders", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Digest</Label>
                    <p className="text-sm text-muted-foreground">Receive a summary of your daily progress</p>
                  </div>
                  <Switch
                    checked={notifications.dailyDigest}
                    onCheckedChange={(checked) => handleNotificationChange("dailyDigest", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Report</Label>
                    <p className="text-sm text-muted-foreground">Get weekly productivity insights</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReport}
                    onCheckedChange={(checked) => handleNotificationChange("weeklyReport", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Streak Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notifications about your productivity streaks</p>
                  </div>
                  <Switch
                    checked={notifications.streakAlerts}
                    onCheckedChange={(checked) => handleNotificationChange("streakAlerts", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Focus Break Reminders</Label>
                    <p className="text-sm text-muted-foreground">Reminders to take breaks during focus sessions</p>
                  </div>
                  <Switch
                    checked={notifications.focusBreaks}
                    onCheckedChange={(checked) => handleNotificationChange("focusBreaks", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Task Priority</Label>
                  <Select
                    value={preferences.defaultTaskPriority}
                    onValueChange={(value) => setPreferences((prev) => ({ ...prev, defaultTaskPriority: value }))}
                  >
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
                  <Label>Week Starts On</Label>
                  <Select
                    value={preferences.weekStartsOn}
                    onValueChange={(value) => setPreferences((prev) => ({ ...prev, weekStartsOn: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">Sunday</SelectItem>
                      <SelectItem value="monday">Monday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Pomodoro Length (minutes)</Label>
                  <Input
                    type="number"
                    min="15"
                    max="60"
                    value={preferences.pomodoroLength}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, pomodoroLength: Number.parseInt(e.target.value) || 25 }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Auto-archive completed tasks (days)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={preferences.autoArchive}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, autoArchive: Number.parseInt(e.target.value) || 30 }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-primary" />
                <span>Data & Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Export Data</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download all your tasks, notes, and settings as a JSON file
                  </p>
                  <Button onClick={handleExportData} variant="outline" className="cursor-pointer">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">Import Data</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Import your data from a previously exported JSON file
                  </p>
                  <Button variant="outline" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2 text-destructive">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Permanently delete all your data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" className="cursor-pointer">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Changes */}
          <div className="flex justify-end">
            <Button
              onClick={async () => {
                setSaveStatus(null);
                setIsSaving(true);
                let success = false;
                // Save avatar if selected
                if (selectedFile) {
                  const formData = new FormData();
                  formData.append("avatar", selectedFile);
                  const res = await fetch("/api/users/avatar", {
                    method: "POST",
                    body: formData,
                    credentials: "include"
                  });
                  if (res.ok) {
                    const data = await res.json();
                    setAvatarUrl(data.avatarUrl);
                    window.dispatchEvent(new CustomEvent("avatarUrlChanged", { detail: { avatarUrl: data.avatarUrl } }));
                    success = true;
                  }
                }
                // Save name if changed
                if (profile.name) {
                  const res = await fetch("/api/users/profile", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ name: profile.name })
                  });
                  if (res.ok) {
                    success = true;
                  }
                }
                setIsSaving(false);
                if (success) {
                  setSaveStatus("Saved Changes");
                  setTimeout(() => setSaveStatus(null), 2500);
                } else {
                  setSaveStatus(null);
                }
              }}
              className={saveStatus ? "bg-green-100 text-green-700 cursor-pointer" : "cursor-pointer"}
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M12 2a10 10 0 1 1-9.95 9.05" />
                  </svg>
                  Saving...
                </span>
              ) : saveStatus ? (
                <span className="flex items-center gap-2">
                  {saveStatus}
                  <Check className="w-4 h-4" />
                </span>
              ) : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
