import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
  id: string;
  wallet_address: string;
  display_name: string;
  created_at: any;
  updated_at: any;
}

export interface LeaderboardScore {
  id: string;
  user_id?: string;
  score: number;
  game_session_id: string;
  wallet_address: string;
  display_name: string;
  created_at: any;
}

// User profile functions
export async function getUserProfile(walletAddress: string): Promise<UserProfile | null> {
  try {
    const q = query(
      collection(db, 'user_profiles'),
      where('wallet_address', '==', walletAddress.toLowerCase()),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function createOrUpdateUserProfile(
  walletAddress: string, 
  displayName: string
): Promise<UserProfile | null> {
  try {
    const existingProfile = await getUserProfile(walletAddress);
    
    if (existingProfile) {
      // Update existing profile
      const profileRef = doc(db, 'user_profiles', existingProfile.id);
      await updateDoc(profileRef, {
        display_name: displayName,
        updated_at: serverTimestamp()
      });
      
      return {
        ...existingProfile,
        display_name: displayName,
        updated_at: serverTimestamp()
      };
    } else {
      // Create new profile
      const profileData = {
        wallet_address: walletAddress.toLowerCase(),
        display_name: displayName,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'user_profiles'), profileData);
      
      return {
        id: docRef.id,
        ...profileData
      } as UserProfile;
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    return null;
  }
}

// Leaderboard functions
export async function getLeaderboard(limitCount: number = 10): Promise<LeaderboardScore[]> {
  try {
    const q = query(
      collection(db, 'leaderboard_scores'),
      orderBy('score', 'desc'),
      orderBy('created_at', 'asc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LeaderboardScore[];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

export async function submitScore(
  walletAddress: string,
  score: number,
  displayName: string = '',
  gameSessionId: string = ''
): Promise<LeaderboardScore | null> {
  try {
    // First, try to get or create user profile
    let userProfile = await getUserProfile(walletAddress);
    
    if (!userProfile && displayName) {
      userProfile = await createOrUpdateUserProfile(walletAddress, displayName);
    }

    const scoreData = {
      user_id: userProfile?.id || null,
      wallet_address: walletAddress.toLowerCase(),
      score: score,
      display_name: displayName || userProfile?.display_name || '',
      game_session_id: gameSessionId,
      created_at: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'leaderboard_scores'), scoreData);

    return {
      id: docRef.id,
      ...scoreData
    } as LeaderboardScore;
  } catch (error) {
    console.error('Error submitting score:', error);
    return null;
  }
}

export async function getUserBestScore(walletAddress: string): Promise<number> {
  try {
    const q = query(
      collection(db, 'leaderboard_scores'),
      where('wallet_address', '==', walletAddress.toLowerCase()),
      orderBy('score', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return 0;
    }
    
    const bestScore = querySnapshot.docs[0].data();
    return bestScore.score || 0;
  } catch (error) {
    console.error('Error fetching user best score:', error);
    return 0;
  }
}