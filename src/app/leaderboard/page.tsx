"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { AppSkeleton } from "@/components/AppSkeleton";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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
      console.log('Leaderboard API Response:', json);
      if (json && Array.isArray(json.data)) {
        console.log('First entry:', json.data[0]);
        setEntries(json.data.slice(0, 50));
      }
    } catch (err: any) {
      setError("Leaderboard data is not available yet.");
      console.error('Leaderboard fetch error:', err);
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
    <div className="flex min-h-screen bg-background flex-col md:flex-row">
      <div className="h-screen flex flex-col sticky top-0 hidden md:flex">
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
                <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
                <p className="text-base text-muted-foreground mt-1">Weekly & Global rankings based on user points</p>
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
              <div className="space-y-8">
                {/* Top 3 highlight */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {entries.slice(0, 3).map((e, i) => (
                    <Card key={e.userId} className={`relative border-2 ${i === 0 ? 'border-yellow-400 shadow-lg' : i === 1 ? 'border-gray-400' : 'border-orange-400'} bg-gradient-to-br from-background to-muted/60`}>
                      <CardHeader className="flex flex-col items-center gap-2 pb-2">
                        <Badge variant="secondary" className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold ${i === 0 ? 'bg-yellow-400 text-yellow-900' : i === 1 ? 'bg-gray-300 text-gray-800' : 'bg-orange-300 text-orange-900'}`}>{i === 0 ? '🥇 1st' : i === 1 ? '🥈 2nd' : '🥉 3rd'}</Badge>
                        <Avatar className="w-16 h-16 ring-4 ring-primary/30">
                          {e.avatarUrl ? (
                            <>
                              <AvatarImage
                                src={e.avatarUrl}
                                alt={e.displayName ?? 'User'}
                                onError={(e) => console.error('Avatar load error for', e.currentTarget.src)}
                                onLoad={() => console.log('Avatar loaded:', e.avatarUrl)}
                              />
                              <AvatarFallback className="text-lg font-bold">
                                {e.displayName ? e.displayName.charAt(0).toUpperCase() : 'U'}
                              </AvatarFallback>
                            </>
                          ) : (
                            <AvatarFallback className="text-lg font-bold">
                              {e.displayName ? e.displayName.charAt(0).toUpperCase() : 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="mt-2 text-lg font-semibold text-center">{e.displayName ?? 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">Rank #{e.rank}</div>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center">
                        <div className="text-2xl font-bold text-primary mb-1">{e.score}</div>
                        <div className="text-xs text-muted-foreground">points</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Full list */}
                <Card className="mt-6">
                  <CardHeader className="border-b pb-2">
                    <div className="grid grid-cols-12 text-xs text-muted-foreground">
                      <div className="col-span-1">#</div>
                      <div className="col-span-7">User</div>
                      <div className="col-span-4 text-right">Score</div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 divide-y">
                    {entries.map((e, idx) => (
                      <div key={`${e.userId}-${e.rank}`} className={`grid grid-cols-12 items-center px-4 py-3 transition-all ${idx < 3 ? 'bg-muted/40' : 'hover:bg-muted/30'} ${idx === 0 ? 'rounded-t-xl' : ''}`}>
                        <div className="col-span-1 font-semibold text-center">{e.rank}</div>
                        <div className="col-span-7 flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            {e.avatarUrl ? (
                              <>
                                <AvatarImage
                                  src={e.avatarUrl}
                                  alt={e.displayName ?? 'User'}
                                  onError={(e) => console.error('Avatar load error:', e.currentTarget.src)}
                                />
                                <AvatarFallback className="text-sm font-semibold">
                                  {e.displayName ? e.displayName.charAt(0).toUpperCase() : 'U'}
                                </AvatarFallback>
                              </>
                            ) : (
                              <AvatarFallback className="text-sm font-semibold">
                                {e.displayName ? e.displayName.charAt(0).toUpperCase() : 'U'}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{e.displayName ?? 'Unknown'}</div>
                            {!e.displayName && e.userId && (
                              <div className="text-xs text-muted-foreground">{String(e.userId).slice(0, 6) + '...'}</div>
                            )}
                          </div>
                        </div>
                        <div className="col-span-4 text-right font-semibold text-primary">{e.score}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
