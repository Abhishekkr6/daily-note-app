import React from "react";

export function AppSkeleton() {
  return (
    <div className="flex h-screen bg-background animate-pulse">
      {/* Sidebar skeleton */}
      <div className="w-64 bg-muted/30 border-r border-border flex flex-col gap-4 p-4">
        <div className="h-10 bg-muted/40 rounded" />
        <div className="h-10 bg-muted/40 rounded" />
        <div className="h-10 bg-muted/40 rounded" />
        <div className="flex-1" />
      </div>
      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar skeleton */}
        <div className="h-16 bg-muted/30 border-b border-border flex items-center px-6 gap-4">
          <div className="w-32 h-8 bg-muted/40 rounded" />
          <div className="w-24 h-8 bg-muted/40 rounded" />
          <div className="flex-1" />
          <div className="w-10 h-10 bg-muted/40 rounded-full" />
        </div>
        {/* Main dashboard skeleton */}
        <main className="flex-1 overflow-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column skeleton */}
          <div className="space-y-6 lg:col-span-2">
            <div className="h-24 bg-muted/20 rounded-xl" />
            <div className="h-40 bg-muted/20 rounded-xl" />
            <div className="h-40 bg-muted/20 rounded-xl" />
            <div className="h-32 bg-muted/20 rounded-xl" />
          </div>
          {/* Right column skeleton */}
          <div className="space-y-6">
            <div className="h-32 bg-muted/20 rounded-xl" />
            <div className="h-40 bg-muted/20 rounded-xl" />
            <div className="h-32 bg-muted/20 rounded-xl" />
          </div>
        </main>
      </div>
    </div>
  );
}
