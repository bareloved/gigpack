-- Add branding fields to gig_packs table
-- These fields allow bands to customize the appearance of their public GigPack pages

-- Add band_logo_url: URL to the band's logo image
ALTER TABLE public.gig_packs
ADD COLUMN IF NOT EXISTS band_logo_url TEXT;

-- Add hero_image_url: URL to an optional hero/banner image for the page header
ALTER TABLE public.gig_packs
ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

-- Add accent_color: Custom accent color (hex or CSS color string)
-- Example values: '#F97316', 'rgb(249, 115, 22)', 'hsl(25, 95%, 53%)'
ALTER TABLE public.gig_packs
ADD COLUMN IF NOT EXISTS accent_color TEXT;

-- Add poster_skin: Visual style variant for vintage_poster theme
-- Allowed values: 'clean', 'paper', 'grain'
-- Default: 'clean' (handled in application code)
ALTER TABLE public.gig_packs
ADD COLUMN IF NOT EXISTS poster_skin TEXT;

COMMENT ON COLUMN public.gig_packs.band_logo_url IS 'URL to band logo image (stored in Supabase Storage)';
COMMENT ON COLUMN public.gig_packs.hero_image_url IS 'URL to hero/banner image for page header';
COMMENT ON COLUMN public.gig_packs.accent_color IS 'Custom accent color (hex, rgb, or hsl)';
COMMENT ON COLUMN public.gig_packs.poster_skin IS 'Poster style variant: clean, paper, or grain';

