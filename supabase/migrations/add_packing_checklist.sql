-- Add packing_checklist column to gig_packs
-- Stores an array of checklist items: [{ id: string, label: string }, ...]
-- Manager defines items, musicians check them off locally (localStorage)

ALTER TABLE public.gig_packs
ADD COLUMN IF NOT EXISTS packing_checklist JSONB DEFAULT NULL;

-- Add a comment for documentation
COMMENT ON COLUMN public.gig_packs.packing_checklist IS 'Array of packing checklist items: [{id: string, label: string}, ...]. Checked state is stored in localStorage per user.';

