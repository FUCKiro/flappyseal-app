import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Reset leaderboard every Monday at 00:00 UTC
export const resetWeeklyLeaderboard = functions.pubsub
  .schedule('0 0 * * 1') // Runs every Monday at midnight
  .timeZone('UTC')
  .onRun(async (context) => {
    const db = admin.firestore();
    
    try {
      // Get all highscores
      const highscores = await db.collection('highscores').get();
      
      // Delete all documents in batches
      const batch = db.batch();
      highscores.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Successfully reset leaderboard. Deleted ${highscores.size} scores.`);
      return null;
    } catch (error) {
      console.error('Error resetting leaderboard:', error);
      return null;
    }
  });