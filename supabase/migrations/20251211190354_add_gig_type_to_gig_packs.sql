-- Add gig_type column to gig_packs
-- Stores the type/category of the gig for visual theme classification
-- Expected values: "wedding", "club_show", "corporate", "bar_gig", "coffee_house", "festival", "rehearsal", "other"
-- Used by lib/gig-visual-theme.ts to select appropriate fallback background images

ALTER TABLE public.gig_packs
ADD COLUMN IF NOT EXISTS gig_type TEXT DEFAULT NULL;

-- Add a comment for documentation
COMMENT ON COLUMN public.gig_packs.gig_type IS 'The type/category of the gig (e.g., "wedding", "club_show", "corporate"). Used for visual theme classification and fallback image selection.';
