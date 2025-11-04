import { connect } from '@/dbConfig/dbConfig';
import LeaderboardEntry from '@/models/leaderboardModel';
import { getWeekKey } from './leaderboardService';

export async function GET(req) {
  try {
    await connect();
  } catch (e) {
    console.error('Leaderboard GET - DB connect failed:', e);
    // In development, return mock data so the UI can be previewed without a DB.
    if (process.env.NODE_ENV === 'development') {
      const mock = [
        { rank: 1, userId: 'user_1', displayName: 'Alice', avatarUrl: null, score: 420 },
        { rank: 2, userId: 'user_2', displayName: 'Bob', avatarUrl: null, score: 380 },
        { rank: 3, userId: 'user_3', displayName: 'Charlie', avatarUrl: null, score: 320 },
        { rank: 4, userId: 'user_4', displayName: 'Dana', avatarUrl: null, score: 280 },
        { rank: 5, userId: 'user_5', displayName: 'Eve', avatarUrl: null, score: 240 }
      ];
      return Response.json({ data: mock, cursor: null, message: 'DB unavailable - development mock' });
    }
    // Return empty data so the frontend can show a friendly placeholder instead of an error
    return Response.json({ data: [], cursor: null, message: 'DB unavailable' });
  }
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || 'weekly';
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);

  // compute period key for weekly
  let periodKey = period === 'global' ? 'global' : getWeekKey();

  const entries = await LeaderboardEntry.find({ period: periodKey }).sort({ score: -1 }).limit(limit).lean();
  const data = entries.map((e, idx) => ({ rank: idx + 1, userId: String(e.userId), displayName: e.displayNameSnapshot, avatarUrl: e.avatarSnapshot, score: e.score }));
  return Response.json({ data, cursor: null });
}

export async function POST(req) {
  // Admin/internals: refresh or recompute (not implemented)
  return Response.json({ ok: true, message: 'Refresh not implemented yet' });
}
