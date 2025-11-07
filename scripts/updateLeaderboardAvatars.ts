/**
 * Script to update all leaderboard entries with user avatars from User collection
 * Run this script once to sync existing leaderboard entries with user profile images
 */

import { connect } from '../src/dbConfig/dbConfig';
import LeaderboardEntry from '../src/models/leaderboardModel';
import User from '../src/models/userModel';

async function updateLeaderboardAvatars() {
  try {
    console.log('Connecting to database...');
    await connect();
    console.log('Connected successfully!');

    // Get all leaderboard entries
    const entries = await LeaderboardEntry.find({});
    console.log(`Found ${entries.length} leaderboard entries to update`);

    let updated = 0;
    let failed = 0;

    for (const entry of entries) {
      try {
        // Fetch the user data
        const user = await User.findById(entry.userId).lean() as any;
        
        if (!user) {
          console.log(`User not found for entry: ${entry.userId}`);
          failed++;
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

        console.log(`✓ Updated ${displayName} (${entry.userId}) - Avatar: ${avatarUrl ? '✓' : '✗'}`);
        updated++;
      } catch (err) {
        console.error(`Failed to update entry ${entry.userId}:`, err);
        failed++;
      }
    }

    console.log('\n=== Update Complete ===');
    console.log(`Successfully updated: ${updated}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total processed: ${entries.length}`);

  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the script
updateLeaderboardAvatars();
