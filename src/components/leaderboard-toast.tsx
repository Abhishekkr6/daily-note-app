"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export const LeaderboardToast: React.FC = () => {
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const seen = typeof window !== 'undefined' && !!localStorage.getItem('leaderboard_toast_seen_v1');
      if (!seen) setShow(true);
    } catch (e) {
      setShow(true);
    }
  }, []);

  function dismiss(persist = true) {
    (async () => {
      if (persist) {
        try { localStorage.setItem('leaderboard_toast_seen_v1', '1'); } catch (e) { }
        try {
          await fetch('/api/users/leaderboard-seen', { method: 'POST', credentials: 'include' });
        } catch (e) {
          // ignore server errors
        }
      }
      setShow(false);
    })();
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          className="fixed bottom-6 right-6 z-[9999] bg-card border border-border px-5 py-3 rounded-2xl shadow-lg flex items-start gap-4 max-w-sm"
        >
          <div className="text-2xl">🏆</div>
          <div className="flex-1">
            <div className="font-semibold">Introducing: Leaderboard</div>
            <div className="text-sm text-muted-foreground">Track your productivity with our new Leaderboard. Earn points for completed tasks and focus sessions, compare weekly performance, and celebrate progress.</div>
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" onClick={() => { dismiss(true); router.push('/leaderboard'); }}>Open Leaderboard</Button>
              <Button variant="ghost" size="sm" onClick={() => dismiss(true)}>Dismiss</Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeaderboardToast;
