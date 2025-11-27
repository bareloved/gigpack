-- Add gig_mood column to gig_packs
-- Stores the mood/vibe label for the gig (e.g., "Laid back 🍷", "High energy 🔥")
-- This is purely for flavor/context, no heavy logic.

ALTER TABLE public.gig_packs
ADD COLUMN IF NOT EXISTS gig_mood TEXT DEFAULT NULL;

-- Add a comment for documentation
COMMENT ON COLUMN public.gig_packs.gig_mood IS 'The mood/vibe of the gig (e.g., "Laid back 🍷", "High energy 🔥"). Display string stored directly for simplicity.';

