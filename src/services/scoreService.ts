import { doc, setDoc, query, orderBy, limit, getDocs, collection, getDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { getCurrentUser } from './authService';

export interface Score {
  score: number;
  timestamp: Date;
  userId: string;
  username: string;
}

// Helper function to check if a timestamp is from the current week
const isCurrentWeek = (timestamp: Date): boolean => {
  const now = new Date();
  const lastMonday = new Date(now);
  lastMonday.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
  lastMonday.setHours(0, 0, 0, 0);
  return timestamp >= lastMonday;
};

// Helper function to perform weekly reset if needed
const checkAndResetWeeklyScores = async () => {
  if (!db) return;

  try {
    const scoresQuery = query(collection(db, 'highscores'));
    const snapshot = await getDocs(scoresQuery);
    
    // Check if we have any scores that need to be reset
    const hasOldScores = snapshot.docs.some(doc => 
      !isCurrentWeek(doc.data().timestamp.toDate())
    );

    if (hasOldScores) {
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('Weekly leaderboard reset completed');
    }
  } catch (error) {
    console.error('Error checking/resetting weekly scores:', error);
  }
};

export const saveScore = async (score: number): Promise<void> => {
  if (!db) {
    console.log('Firebase not configured - scores will not be saved');
    return;
  }

  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Must be logged in to save score');
    if (!user.emailVerified) throw new Error('Must verify email to save score');

    // Check if current score is better than existing high score
    const highscoreRef = doc(db, 'highscores', user.uid);
    const highscoreDoc = await getDoc(highscoreRef);
    
    if (!highscoreDoc.exists() || highscoreDoc.data().score < score) {
      await setDoc(highscoreRef, {
        score,
        timestamp: new Date(),
        userId: user.uid,
        username: user.username
      });
    }
  } catch (error) {
    console.error('Error saving score:', error);
  }
};

export const getTopScores = async (limit_: number = 10): Promise<Score[]> => {
  if (!db) {
    console.log('Firebase not configured - leaderboard disabled');
    return [];
  }

  try {
    // Check and reset if needed before getting scores
    await checkAndResetWeeklyScores();

    const q = query(
      collection(db, 'highscores'),
      orderBy('score', 'desc'),
      limit(limit_)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      score: doc.data().score,
      timestamp: doc.data().timestamp.toDate(),
      userId: doc.data().userId,
      username: doc.data().username
    }));
  } catch (error) {
    console.error('Error getting top scores:', error);
    return [];
  }
};