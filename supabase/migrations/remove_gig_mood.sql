-- Remove gig_mood column from gig_packs
-- This column is no longer needed

-- Drop the column
ALTER TABLE public.gig_packs
DROP COLUMN IF EXISTS gig_mood;

-- The comment will be automatically removed when the column is dropped
