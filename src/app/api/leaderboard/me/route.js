import { connect } from '@/dbConfig/dbConfig';
import LeaderboardEntry from '@/models/leaderboardModel';
import { getDataFromToken } from '@/helpers/getDataFromToken';

export async function GET(req) {
  try {
    await connect();
  } catch (e) {
    console.error('Leaderboard /me - DB connect failed:', e);
    if (process.env.NODE_ENV === 'development') {
      return Response.json({ me: { rank: 2, score: 380 }, neighbors: [
        { userId: 'user_1', displayName: 'Alice', score: 420 },
        { userId: 'user_2', displayName: 'Bob', score: 380 },
        { userId: 'user_3', displayName: 'Charlie', score: 320 }
      ], message: 'DB unavailable - development mock' });
    }
    return Response.json({ me: null, neighbors: [], message: 'DB unavailable' });
  }
  let userId;
  try {
    userId = getDataFromToken(req);
  } catch (err) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || 'weekly';
  // compute periodKey same as route
  let periodKey = period === 'global' ? 'global' : (() => {
    const d = new Date();
    const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  })();

  const me = await LeaderboardEntry.findOne({ userId, period: periodKey }).lean();
  if (!me) return Response.json({ me: null, neighbors: [] });
  // compute rank via count greater than score
  const higherCount = await LeaderboardEntry.countDocuments({ period: periodKey, score: { $gt: me.score } });
  const rank = higherCount + 1;
  // neighbors: 5 above, 5 below
  const above = await LeaderboardEntry.find({ period: periodKey, score: { $gt: me.score } }).sort({ score: -1 }).limit(5).lean();
  const below = await LeaderboardEntry.find({ period: periodKey, score: { $lt: me.score } }).sort({ score: -1 }).limit(5).lean();
  const neighbors = [...above, me, ...below].map((e) => ({ userId: String(e.userId), displayName: e.displayNameSnapshot, score: e.score }));
  return Response.json({ me: { rank, score: me.score }, neighbors });
}
