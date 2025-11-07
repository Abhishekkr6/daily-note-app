"use client";
import { useEffect, useRef, useState } from "react";

type Task = {
  _id?: string;
  title: string;
  status: "overdue" | "today" | "completed";
  dueDate?: string;
  notificationTime?: string;
};

export default function TaskNotificationGlobal() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeNotification, setActiveNotification] = useState<{ id: string; title: string; time: string } | null>(null);
  const [animateOut, setAnimateOut] = useState(false);
  const alarmAudioRef = useRef<HTMLAudioElement>(null);
  const dismissedNotificationsRef = useRef<Set<string>>(new Set());

  // Fetch tasks every minute
  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      // Be defensive: API may return an object { error: ..., message: ... } or { tasks: [...] }
      if (Array.isArray(data)) {
        setTasks(data);
      } else if (data && Array.isArray((data as any).tasks)) {
        setTasks((data as any).tasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      // ignore
    }
  };
  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 60000);
    return () => clearInterval(interval);
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

  // Notification popup and alarm logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
      const todayStr = now.toISOString().slice(0, 10);
      // Ensure we only call array methods on arrays — guard against unexpected API shapes
      const list = Array.isArray(tasks) ? tasks : [];
      const match = list.find(
        (t) => t && t.status === "today" && t.notificationTime === currentTime && (!t.dueDate || t.dueDate === todayStr)
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
    }, 1000);
    return () => clearInterval(interval);
  }, [tasks, activeNotification]);

  // Auto-dismiss notification after 10 seconds with exit animation
  useEffect(() => {
    if (activeNotification) {
      setAnimateOut(false);
      const timer = setTimeout(() => {
        setAnimateOut(true);
        setTimeout(() => {
          dismissedNotificationsRef.current.add(`${activeNotification.id}_${activeNotification.time}`);
          setActiveNotification(null);
        }, 400); // match exit animation duration
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [activeNotification]);

  // Request notification permission on mount
  useEffect(() => {
    if (window.Notification && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <>
      {activeNotification && (
        <div
          className={`fixed top-1/2 left-1/2 z-[99999] transform -translate-x-1/2 -translate-y-1/2 bg-white border border-primary shadow-2xl rounded-2xl px-8 py-6 flex flex-col items-center transition-all duration-400
            ${animateOut ? 'opacity-0 scale-90' : 'opacity-100 scale-100'} animate-fade-in`}
        >
          <div className="flex items-center gap-3 mb-2">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#2563eb" d="M12 2a6 6 0 0 0-6 6v4.586l-.707.707A1 1 0 0 0 6 16h12a1 1 0 0 0 .707-1.707L18 12.586V8a6 6 0 0 0-6-6Zm0 20a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Z"/></svg>
            <span className="text-xl font-bold text-primary">Task Reminder</span>
          </div>
          <div className="text-lg font-semibold mb-2">{activeNotification.title}</div>
          <div className="text-sm text-muted-foreground mb-4">It's time for your scheduled task!</div>
          <button
            className="mt-2 px-4 py-2 rounded bg-primary text-white font-medium shadow cursor-pointer hover:bg-primary/80 transition"
            onClick={() => {
              setAnimateOut(true);
              setTimeout(() => {
                dismissedNotificationsRef.current.add(`${activeNotification.id}_${activeNotification.time}`);
                setActiveNotification(null);
              }, 400);
            }}
          >
            Dismiss
          </button>
        </div>
      )}
      <audio
        ref={alarmAudioRef}
        src="https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b2b2.mp3"
        preload="auto"
      />
    </>
  );
}