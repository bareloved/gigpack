-- GigPack Database Schema
-- This schema is completely separate from any existing app
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies: users can only see and update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- GIG PACKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.gig_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  band_name TEXT,
  date DATE,
  call_time TEXT,
  on_stage_time TEXT,
  venue_name TEXT,
  venue_address TEXT,
  venue_maps_url TEXT,
  lineup JSONB DEFAULT '[]'::JSONB,
  setlist TEXT,
  dress_code TEXT,
  backline_notes TEXT,
  parking_notes TEXT,
  payment_notes TEXT,
  internal_notes TEXT,
  public_slug TEXT NOT NULL UNIQUE,
  theme TEXT DEFAULT 'minimal',
  is_archived BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index on slug for fast public lookups
CREATE INDEX IF NOT EXISTS idx_gig_packs_public_slug ON public.gig_packs(public_slug);
CREATE INDEX IF NOT EXISTS idx_gig_packs_owner_id ON public.gig_packs(owner_id);

-- Enable RLS
ALTER TABLE public.gig_packs ENABLE ROW LEVEL SECURITY;

-- Gig Packs policies for authenticated users (owners only)
CREATE POLICY "Owners can view own gig packs"
  ON public.gig_packs
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert own gig packs"
  ON public.gig_packs
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own gig packs"
  ON public.gig_packs
  FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own gig packs"
  ON public.gig_packs
  FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for gig_packs updated_at
CREATE TRIGGER update_gig_packs_updated_at
  BEFORE UPDATE ON public.gig_packs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup (create profile automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- NOTES
-- ============================================================================
-- For public access to gig packs by slug, we use a Next.js API route
-- with the service role key instead of an RLS policy.
-- This is simpler and more secure for this use case.
--
-- The API route at /api/gigpack/[slug] will:
-- 1. Use service role client to bypass RLS
-- 2. Fetch gig pack by public_slug
-- 3. Return only public-safe fields (excluding internal_notes)
-- 4. Return 404 if not found or is_archived = true

