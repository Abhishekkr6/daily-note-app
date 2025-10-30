"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface FocusModeProps {
  params: {
    taskId: string;
  };
}

export default function FocusModePage({ params }: FocusModeProps) {
  const { taskId } = params;
  const [task, setTask] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch task details
  useEffect(() => {
    async function fetchTask() {
      try {
        const res = await axios.get(`/api/tasks/${taskId}`);
        setTask(res.data.task);
      } catch {
        setError("Failed to load task");
      }
    }
    fetchTask();
  }, [taskId]);

  // Start focus session on mount
  useEffect(() => {
    async function startSession() {
      try {
        const res = await axios.post("/api/focus-session/", {
          taskId,
          duration: 25, // 25 minutes
        });
        setSession(res.data.session);
        setTimer(res.data.session.duration * 60); // Convert minutes to seconds
        setIsRunning(true);
      } catch {
        setError("Failed to start focus session");
      } finally {
        setLoading(false);
      }
    }
    startSession();

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [taskId]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && session) {
      handleComplete();
    }

    // Cleanup the interval when paused or unmounted
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, timer, session]);

  async function handleComplete() {
    setIsRunning(false);
    if (!session) return;
    try {
      await axios.patch("/api/focus-session/", {
        taskId,
        sessionId: session._id,
      });
      router.push("/tasks");
    } catch {
      setError("Failed to complete session");
    }
  }

  function handleExit() {
    setIsRunning(false);
    router.push("/tasks");
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );

  if (error)
    return <div className="text-red-500 p-4 text-center">{error}</div>;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <h1 className="text-3xl font-bold mb-4">Focus Mode</h1>
      <div className="mb-6 text-xl">{task?.title || "Task"}</div>
      <div className="text-6xl font-mono mb-8">
        {Math.floor(timer / 60).toString().padStart(2, "0")}:
        {(timer % 60).toString().padStart(2, "0")}
      </div>
      <div className="flex gap-4">
        <button
          className="bg-green-600 px-6 py-2 rounded text-lg font-semibold hover:bg-green-700"
          onClick={handleComplete}
          disabled={!isRunning}
        >
          Complete
        </button>
        <button
          className="bg-gray-700 px-6 py-2 rounded text-lg font-semibold hover:bg-gray-800"
          onClick={handleExit}
        >
          Exit
        </button>
      </div>
    </div>
  );
}
