import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface UserProfile {
  id: string
  wallet_address: string
  display_name: string
  created_at: string
  updated_at: string
}

export interface LeaderboardScore {
  id: string
  user_id: string
  score: number
  game_session_id: string
  wallet_address: string
  display_name: string
  created_at: string
}

// User profile functions
export async function getUserProfile(walletAddress: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

export async function createOrUpdateUserProfile(walletAddress: string, displayName: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      wallet_address: walletAddress.toLowerCase(),
      display_name: displayName,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'wallet_address'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating/updating user profile:', error)
    return null
  }

  return data
}

// Leaderboard functions
export async function getLeaderboard(limit: number = 10): Promise<LeaderboardScore[]> {
  const { data, error } = await supabase
    .from('leaderboard_scores')
    .select('*')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }

  return data || []
}

export async function submitScore(
  walletAddress: string,
  score: number,
  displayName: string = '',
  gameSessionId: string = ''
): Promise<LeaderboardScore | null> {
  // First, try to get or create user profile
  let userProfile = await getUserProfile(walletAddress)
  
  if (!userProfile && displayName) {
    userProfile = await createOrUpdateUserProfile(walletAddress, displayName)
  }

  const { data, error } = await supabase
    .from('leaderboard_scores')
    .insert({
      user_id: userProfile?.id || null,
      wallet_address: walletAddress.toLowerCase(),
      score: score,
      display_name: displayName || userProfile?.display_name || '',
      game_session_id: gameSessionId
    })
    .select()
    .single()

  if (error) {
    console.error('Error submitting score:', error)
    return null
  }

  return data
}

export async function getUserBestScore(walletAddress: string): Promise<number> {
  const { data, error } = await supabase
    .from('leaderboard_scores')
    .select('score')
    .eq('wallet_address', walletAddress.toLowerCase())
    .order('score', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user best score:', error)
    return 0
  }

  return data?.score || 0
}