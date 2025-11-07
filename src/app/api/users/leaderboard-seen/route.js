import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import { getToken } from 'next-auth/jwt';

export async function POST(req) {
  await connect();
  let userId;
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    userId = token.id;
  } catch (err) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
    // ensure preferences object exists
    user.set('preferences.leaderboardSeen', true);
    await user.save();
    return Response.json({ ok: true });
  } catch (e) {
    console.error('leaderboard-seen update failed', e);
    return Response.json({ ok: false, error: 'update_failed' }, { status: 500 });
  }
}
