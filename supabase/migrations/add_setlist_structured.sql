-- Add structured setlist column to gig_packs table
-- This migration adds a JSONB column to store structured setlist data

ALTER TABLE public.gig_packs
ADD COLUMN IF NOT EXISTS setlist_structured JSONB;

-- Add a comment to document the column's purpose
COMMENT ON COLUMN public.gig_packs.setlist_structured IS 'Structured setlist with sections and songs (SetlistSection[])';

-- The structure expected in this JSONB column:
-- [
--   {
--     "id": "unique-string",
--     "name": "Set 1",
--     "songs": [
--       {
--         "id": "unique-string",
--         "title": "Song Title",
--         "artist": "Artist Name (optional)",
--         "key": "C (optional)",
--         "tempo": "120 (optional)",
--         "notes": "Watch ending (optional)",
--         "referenceUrl": "https://... (optional)"
--       }
--     ]
--   }
-- ]

