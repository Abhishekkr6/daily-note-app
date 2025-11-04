"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { AppSkeleton } from "@/components/AppSkeleton";
import { Button } from "@/components/ui/button";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  score: number;
}

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // small UX delay like other pages
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Extracted fetchLeaderboard so it can be reused for refresh
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/leaderboard?period=weekly&limit=50`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (json && Array.isArray(json.data)) setEntries(json.data.slice(0, 50));
    } catch (err: any) {
      setError("Leaderboard data is not available yet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    // small UX delay like other pages
    // The loading state is now handled in fetchLeaderboard
  }, []);

  if (loading) return <AppSkeleton />;

  return (
    <div className="flex min-h-screen bg-background">
      <div className="h-screen flex flex-col sticky top-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-10">
          <TopBar />
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold">Leaderboard</h1>
                <p className="text-sm text-muted-foreground">Weekly & Global rankings based on user points</p>
              </div>
              <div>
                <Button variant="outline" onClick={fetchLeaderboard}>Refresh</Button>
              </div>
            </div>

            {error && (
              <div className="p-4 mb-4 rounded-md bg-yellow-50 text-yellow-800">{error}</div>
            )}

            {entries.length === 0 ? (
              <div className="rounded-lg border border-border p-6 text-center">
                <h2 className="text-lg font-medium mb-2">Leaderboard coming soon</h2>
                <p className="text-sm text-muted-foreground mb-4">No leaderboard data available yet. The feature will appear here once enabled.</p>
                <div className="flex justify-center">
                  <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Top 3 highlight */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {entries.slice(0, 3).map((e) => (
                    <div key={e.userId} className="p-4 rounded-lg border border-border">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">{e.displayName ? e.displayName.charAt(0) : 'U'}</div>
                        <div>
                          <div className="text-sm font-medium">{e.displayName ?? 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground">Rank #{e.rank}</div>
                        </div>
                        <div className="ml-auto text-right">
                          <div className="text-lg font-bold">{e.score}</div>
                          <div className="text-xs text-muted-foreground">points</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Full list */}
                <div className="mt-4 bg-card rounded-md border">
                  <div className="p-3 border-b grid grid-cols-12 text-xs text-muted-foreground">
                    <div className="col-span-1">#</div>
                    <div className="col-span-7">User</div>
                    <div className="col-span-4 text-right">Score</div>
                  </div>
                  <div>
                    {entries.map((e) => (
                      <div key={`${e.userId}-${e.rank}`} className="p-3 grid grid-cols-12 items-center hover:bg-muted/50">
                        <div className="col-span-1">{e.rank}</div>
                        <div className="col-span-7 flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">{e.displayName ? e.displayName.charAt(0) : 'U'}</div>
                          <div>
                            <div className="text-sm">{e.displayName ?? 'Unknown'}</div>
                            {!e.displayName && e.userId && (
                              <div className="text-xs text-muted-foreground">{String(e.userId).slice(0, 6) + '...'}</div>
                            )}
                          </div>
                        </div>
                        <div className="col-span-4 text-right font-medium">{e.score}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
