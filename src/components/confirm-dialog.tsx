"use client";
import * as React from "react";

export default function ConfirmDialog({ open, onConfirm, onCancel, message }: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-8 w-full max-w-md text-center scale-95 animate-pop-in">
        <div className="mb-2 text-xl font-bold text-destructive">⚠️ Warning</div>
        <div className="mb-6 text-sm text-foreground/80 leading-relaxed">{message}</div>
        <div className="flex justify-center gap-4 mt-6">
          <button
            className="px-6 py-2.5 rounded-lg bg-destructive text-white font-medium shadow hover:bg-destructive/90 transition-all hover:scale-105"
            onClick={onConfirm}
          >
            Yes, Delete Everything
          </button>
          <button
            className="px-6 py-2.5 rounded-lg bg-muted text-foreground font-medium shadow hover:bg-muted/70 transition-all hover:scale-105"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
      <style jsx>{`
        .animate-fade-in { animation: fadeInBg 0.2s ease; }
        .animate-pop-in { animation: popIn 0.22s cubic-bezier(.4,2,.6,1) both; }
        @keyframes fadeInBg { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.85); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
