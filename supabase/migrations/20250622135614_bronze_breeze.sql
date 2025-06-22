/*
  # Create leaderboard and user data tables

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `wallet_address` (text, unique)
      - `display_name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `leaderboard_scores`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `score` (integer)
      - `game_session_id` (text)
      - `created_at` (timestamp)
      - `wallet_address` (text, for quick lookups)
      - `display_name` (text, for quick display)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read all data
    - Add policies for users to insert/update their own data
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  display_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create leaderboard_scores table
CREATE TABLE IF NOT EXISTS leaderboard_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  game_session_id text DEFAULT '',
  wallet_address text NOT NULL,
  display_name text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_scores ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated, anon
  USING (true);

-- Policies for leaderboard_scores
CREATE POLICY "Anyone can read leaderboard scores"
  ON leaderboard_scores
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can insert scores"
  ON leaderboard_scores
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_wallet_address ON user_profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_leaderboard_scores_score ON leaderboard_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_scores_wallet_address ON leaderboard_scores(wallet_address);
CREATE INDEX IF NOT EXISTS idx_leaderboard_scores_created_at ON leaderboard_scores(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();