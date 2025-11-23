-- Migration: Add theme column to gig_packs table
-- This migration adds support for per-gig design themes

-- Add theme column with default value 'minimal'
ALTER TABLE public.gig_packs 
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'minimal';

-- Update existing rows to have 'minimal' theme if NULL
UPDATE public.gig_packs 
SET theme = 'minimal' 
WHERE theme IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.gig_packs.theme IS 'Design theme for the public GigPack page. Options: minimal, vintage_poster, social_card. Default: minimal';

