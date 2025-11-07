import { connect } from '@/dbConfig/dbConfig';
import LeaderboardEntry from '@/models/leaderboardModel';
import User from '@/models/userModel';

/**
 * API endpoint to sync all leaderboard entries with user avatars
 * Call this endpoint once to update all existing leaderboard entries
 */
export async function POST(req) {
  try {
    await connect();
    
    // Get all leaderboard entries
    const entries = await LeaderboardEntry.find({});
    console.log(`Found ${entries.length} leaderboard entries to update`);

    let updated = 0;
    let failed = 0;
    const results = [];

    for (const entry of entries) {
      try {
        // Fetch the user data
        const user = await User.findById(entry.userId).lean();
        
        if (!user) {
          console.log(`User not found for entry: ${entry.userId}`);
          failed++;
          results.push({ userId: entry.userId, status: 'failed', reason: 'User not found' });
          continue;
        }

        // Update the entry with user's current avatar and display name
        const displayName = user.name || user.username || user.email || 'Unknown';
        const avatarUrl = user.avatarUrl || null;

        await LeaderboardEntry.updateOne(
          { _id: entry._id },
          { 
            $set: { 
              avatarSnapshot: avatarUrl,
              displayNameSnapshot: displayName
            } 
          }
        );

        console.log(`✓ Updated ${displayName} (${entry.userId}) - Avatar: ${avatarUrl ? 'yes' : 'no'}`);
        updated++;
        results.push({ 
          userId: entry.userId.toString(), 
          displayName, 
          avatarUrl: avatarUrl || 'none', 
          status: 'success' 
        });
      } catch (err) {
        console.error(`Failed to update entry ${entry.userId}:`, err);
        failed++;
        results.push({ userId: entry.userId.toString(), status: 'failed', error: err.message });
      }
    }

    return Response.json({ 
      success: true,
      message: 'Avatar sync complete',
      stats: {
        total: entries.length,
        updated,
        failed
      },
      results
    });

  } catch (error) {
    console.error('Avatar sync failed:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
