"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Settings, User, Bell, Palette, Download, Upload, Trash2, Clock, Database, LogOut } from "lucide-react"
import { Check } from "lucide-react"
import { signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import ConfirmDialog from "@/components/confirm-dialog"
import { useRouter } from "next/navigation"

export function SettingsPage() {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    try {
      // Use NextAuth signOut which will clear the session and redirect.
      // Redirect to homepage after sign out.
      await signOut({ callbackUrl: '/' });
    } catch (err) {
      // Optionally show error toast
      console.error("Sign out failed:", err);
      // Fallback: navigate to homepage
      window.location.href = '/';
    }
  };

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/users/delete-all-data", {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        // Sign out and redirect to landing page
        await signOut({ callbackUrl: "/landing" });
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || "Failed to delete data"}`);
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      alert("Failed to delete data. Please try again.");
      setIsDeleting(false);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [animating, setAnimating] = useState(false);
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
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    timezone: "America/New_York",
    workingHours: { start: "09:00", end: "17:00" },
  });

  const [notifications, setNotifications] = useState({
    taskReminders: true,
    dailyDigest: true,
    weeklyReport: false,
    streakAlerts: true,
    focusBreaks: true,
  });

  // Fetch notification settings from backend using auth token
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/users/notifications`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [profile.email]);

  const [preferences, setPreferences] = useState({
    defaultTaskPriority: "medium",
    pomodoroLength: 25,
    shortBreak: 5,
    longBreak: 15,
    autoArchive: 30,
    weekStartsOn: "monday",
  })

  // Fetch user profile from API, but prefer NextAuth session initially
  const { data: session, status } = useSession();
  React.useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      try {
        const sUser = session?.user as any;
        if (sUser) {
          if (!mounted) return;
          // Apply session-provided public fields, but still fetch the full profile
          // from the API so server-side settings (timezone, workingHours) are used.
          setProfile((prev) => ({
            ...prev,
            name: sUser.name || "",
            email: sUser.email || "",
          }));
          setAvatarUrl(sUser.image || null);
          // Do NOT return here — continue to fetch /api/users/profile to get timezone and workingHours
        }

        if (status === "loading") return;

        const res = await fetch("/api/users/profile", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (!mounted) return;
          setProfile((prev) => ({
            ...prev,
            name: data.name || "",
            email: data.email || "",
            timezone: data.timezone || "America/New_York",
            workingHours: data.workingHours || { start: "09:00", end: "17:00" },
          }));
          setAvatarUrl(data.avatarUrl || null);
        }
      } catch (err) {
        // handle error (optional)
      }
      setAvatarLoading(false);
    }
    fetchProfile();
    return () => { mounted = false };
  }, [session, status]);

  // Debug: log session/profile/avatar for troubleshooting
  useEffect(() => {
    try {
      console.debug("SettingsPage session:", session);
      console.debug("SettingsPage profile state:", profile);
      console.debug("SettingsPage avatarUrl:", avatarUrl);
    } catch (e) { }
  }, [session, profile, avatarUrl]);

  // Animate avatar on change
  useEffect(() => {
    if (selectedFile || avatarUrl) {
      setAnimating(true);
      const timeout = setTimeout(() => setAnimating(false), 700);
      return () => clearTimeout(timeout);
    }
  }, [selectedFile, avatarUrl]);

  const handleNotificationChange = async (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    // Only send email when enabling a notification
    if (value && profile.email) {
      try {
        await fetch("/api/notifications/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: profile.email,
            notificationType: key,
            extraData: {}, // You can pass more info if needed
          }),
        });
        // Optionally show a toast/alert for success
      } catch (err) {
        // Optionally show a toast/alert for error
      }
    }
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
                <Avatar className={`w-20 h-20 border-2 border-border shadow-md bg-background ${animating ? "animate-spin-slow" : ""}`}>
                  {avatarLoading ? (
                    <div className="animate-pulse w-full h-full bg-muted rounded-full" />
                  ) : selectedFile ? (
                    <AvatarImage src={avatarUrl || ""} alt="Profile" className="object-cover w-full h-full rounded-full" />
                  ) : avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Profile" className="object-cover w-full h-full rounded-full" />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl flex items-center justify-center w-full h-full rounded-full">
                      {profile.name
                        ? profile.name[0].toUpperCase()
                        : profile.email
                          ? profile.email[0].toUpperCase()
                          : ""}
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Input
                    type="time"
                    value={profile.workingHours.start}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        workingHours: { ...prev.workingHours, start: e.target.value },
                      }))
                    }
                    className="w-full sm:w-32"
                  />
                  <span className="text-muted-foreground hidden sm:inline">to</span>
                  <span className="text-muted-foreground sm:hidden text-center">to</span>
                  <Input
                    type="time"
                    value={profile.workingHours.end}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        workingHours: { ...prev.workingHours, end: e.target.value },
                      }))
                    }
                    className="w-full sm:w-32"
                  />
                </div>
              </div>

              {/* Save button moved here (swapped with bottom Logout) */}
              <div className="flex justify-end pt-2">
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
                    // Save name, timezone, working hours
                    const profileRes = await fetch("/api/users/profile", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify({
                        name: profile.name,
                        timezone: profile.timezone,
                        workingHours: profile.workingHours
                      })
                    });
                    if (profileRes.ok) {
                      success = true;
                      try {
                        const data = await profileRes.json();
                        // Update local profile state so timezone and working hours (and name) reflect immediately
                        setProfile((prev) => ({
                          ...prev,
                          name: data.name || prev.name,
                          timezone: data.timezone || prev.timezone,
                          workingHours: data.workingHours || prev.workingHours,
                        }));
                        if (data.avatarUrl) {
                          setAvatarUrl(data.avatarUrl);
                        }
                      } catch (e) {
                        // ignore JSON parse errors
                      }
                    }
                    // Save notification settings
                    try {
                      const notifRes = await fetch("/api/users/notifications", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ notifications }),
                      });
                      if (notifRes.ok) {
                        success = true;
                        // Refetch notifications to ensure state is up-to-date
                        await fetchNotifications();
                      }
                    } catch (err) {
                      // Optionally handle error
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
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isDeleting ? "Deleting..." : "Delete All Data"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Changes */}
          <div className="flex flex-col gap-2 justify-end">
            <div className="flex justify-end">
              <Button variant="destructive" className="cursor-pointer" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onConfirm={handleDeleteAllData}
        onCancel={() => setShowDeleteConfirm(false)}
        message="Are you sure you want to delete all your data? This will permanently delete your account, tasks, notes, templates, moods, focus sessions, and all other data. This action cannot be undone!"
      />
    </div>
  )
}
