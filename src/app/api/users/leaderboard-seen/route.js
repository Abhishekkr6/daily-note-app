import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import { getDataFromToken } from '@/helpers/getDataFromToken';

export async function POST(req) {
  await connect();
  let userId;
  try {
    userId = await getDataFromToken(req);
  } catch (err) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
    // ensure preferences object exists
    if (!user.preferences) user.preferences = {};
    user.preferences.leaderboardSeen = true;
    await user.save();
    return Response.json({ ok: true });
  } catch (e) {
    console.error('leaderboard-seen update failed', e);
    return Response.json({ ok: false, error: 'update_failed' }, { status: 500 });
  }
}
