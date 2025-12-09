-- =====================================================
-- User Management Setup: Profiles Table
-- =====================================================
-- This migration creates the profiles table that extends auth.users
-- with additional user information and profile data

-- Create profiles table
CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at timestamp with time zone,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  website text,
  is_admin boolean,
  email text,
  
  -- Constraints
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles (requires has_permission function)
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (has_permission('user_profiles.read'));

-- Add table comment
COMMENT ON TABLE profiles IS 'User profiles extending auth.users with additional information';
