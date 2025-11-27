# Band Branding & Poster Skins - Implementation Summary

## Overview

Successfully implemented **Band Branding & Poster Skins** features for GigPack, allowing bands to customize the visual identity of their public GigPack pages with logos, hero images, custom accent colors, and background textures.

---

## What Was Added

### 1. Database Schema Changes

**Migration Files Created:**
- `supabase/migrations/add_branding_fields.sql` - Adds 4 new columns to `gig_packs` table
- `supabase/migrations/create_gigpack_assets_bucket.sql` - Sets up Supabase Storage for images

**New Database Columns:**
- `band_logo_url` (text, nullable) - URL to band logo image
- `hero_image_url` (text, nullable) - URL to hero/banner image
- `accent_color` (text, nullable) - Custom accent color (hex, rgb, or hsl)
- `poster_skin` (text, nullable) - Background style variant: 'clean', 'paper', or 'grain'

**Storage Bucket:**
- Bucket name: `gigpack-assets`
- Public read access for viewing images
- Authenticated users can upload/update/delete their own images
- 5MB file size limit per image
- Allowed formats: JPEG, PNG, WebP, GIF, SVG

---

## 2. TypeScript Types Updated

**File:** `lib/types.ts`

Added:
- New type: `PosterSkin` = "clean" | "paper" | "grain"
- Extended `GigPack` interface with 4 new branding fields
- All fields are nullable for backward compatibility

---

## 3. Image Upload System

**New File:** `lib/image-upload.ts`

**Functions:**
- `validateImageFile(file)` - Validates file size and type
- `uploadImage(file, userId, oldPath?)` - Uploads image to Supabase Storage
  - Generates unique filenames with timestamps
  - Organizes images in user-specific folders: `{userId}/{timestamp}-{filename}`
  - Optionally deletes old image on replacement
  - Returns public URL or error
- `deleteImage(path)` - Removes image from storage
- `getPathFromUrl(url)` - Extracts storage path from public URL

**Upload Constraints:**
- Max file size: 5MB
- Allowed types: JPEG, JPG, PNG, WebP, GIF, SVG

---

## 4. Manager UI - Branding Section

**File:** `components/gigpack-form.tsx`

**New Section:** Added "Branding" section between "Design" and "Logistics"

**Features:**

### Band Logo Upload
- Preview thumbnail (24x24 grid)
- Upload/Change/Remove buttons
- Loading state during upload
- Hidden file input with accept="image/*"

### Hero Image Upload
- Larger preview (48x32 grid, covers)
- Upload/Change/Remove buttons
- Loading state during upload
- Banner-style image for page header

### Accent Color Picker
- 6 preset color swatches for quick selection
  - Orange (#F97316), Red (#EF4444), Purple (#8B5CF6)
  - Green (#10B981), Blue (#3B82F6), Amber (#F59E0B)
- Custom hex color text input
- Color swatch highlights when selected

### Poster Skin Selector
- Radio group with 3 options:
  - **Clean**: Simple solid colors (default)
  - **Paper**: Subtle paper-like texture
  - **Grain**: Grainy, vintage feel
- Visual descriptions for each option

**State Management:**
- Added state variables for all branding fields
- Upload handlers with error handling and toasts
- Remove handlers with cleanup
- Integrated into save/update flow

---

## 5. Public Page Layouts - Branding Support

### Minimal Layout (`components/gigpack/layouts/minimal-layout.tsx`)

**Hero Image:**
- Displays at top if `hero_image_url` is set
- Rounded-top banner (48/64 height)
- Overlay for text readability
- Card rounds only bottom corners when hero is present

**Band Logo:**
- Shows centered above title if `band_logo_url` is set
- Max size: 120x80px

**Accent Color:**
- Applied to:
  - Calendar icon
  - Section header text and borders (Venue, Lineup, Setlist, Logistics)
  - Setlist item numbers
  - "Open in Maps" button border
- Uses CSS inline styles for dynamic color

**Poster Skin:**
- Applied via CSS class: `poster-skin-{clean|paper|grain}`

---

### Vintage Poster Layout (`components/gigpack/layouts/vintage-poster-layout.tsx`)

**Hero Image:**
- Displays as poster art at top if `hero_image_url` is set
- Height: 64/80 (md)
- Overlay for contrast
- Logo overlays hero in top-left corner (if both exist)

**Band Logo:**
- If hero image exists: overlays hero in top-left with white/dark background
- If no hero: displays in header bar above title
- Max size: 80x60px in compact format

**Accent Color:**
- Replaces default amber/orange throughout:
  - **Header bar background** (gradient)
  - **Date block border and text**
  - **Venue map pin icon**
  - **All section headers** (WHO'S PLAYING, SETLIST, LOGISTICS)
  - **Section label badges** (background + border)
  - **Lineup item left borders**
  - **Setlist item numbers**
  - **Logistics card top borders**
  - **"Open in Maps" button**
  - **Footer "GigPack" text**

**Poster Skin:**
- Applied via CSS class to main card
- Strongest visual impact in this theme

**Default Accent Color:**
- Falls back to `hsl(25, 85%, 50%)` if not set (warm amber/orange)

---

### Social Card Layout (`components/gigpack/layouts/social-card-layout.tsx`)

**Hero Image:**
- Replaces gradient hero banner if `hero_image_url` is set
- Height: 48/64 (md)
- Used as cover image like social media posts
- Overlay for text contrast

**Band Logo:**
- Displays as **circular avatar**
- If hero exists: overlaps bottom-left edge of hero (-12 offset)
- If no hero: positioned in top-left corner of banner
- Size: 20x20 / 24x24 (md)
- White/dark background with border
- Similar to social media profile pictures

**Accent Color:**
- Applied to:
  - **Hero banner background** (if no hero image)
  - **Hero banner overlay tint** (if hero image exists)
  - **All section header text** (Venue, Schedule, Lineup, Setlist, Logistics)
  - **Setlist item numbers**
  - **"Open in Maps" button border**
  - **Footer "GigPack" text**

**Poster Skin:**
- Applied to page background container

**Layout Adjustment:**
- Adds top margin (mt-16) to cards if logo overlaps hero

---

## 6. CSS Poster Skin Styles

**File:** `app/globals.css`

### Clean Skin (`.poster-skin-clean`)
- Simple `bg-card` background
- No texture or pattern
- Default look

### Paper Skin (`.poster-skin-paper`)
- Light: Off-white/cream (`hsl(45, 30%, 98%)`)
- Dark: Slightly lighter card (`hsl(222, 18%, 16%)`)
- Subtle crosshatch pattern using gradients
- Inset box shadow for depth
- Paper-like texture via CSS

### Grain Skin (`.poster-skin-grain`)
- Light: Warm beige (`hsl(40, 25%, 95%)`)
- Dark: Deep charcoal (`hsl(222, 18%, 13%)`)
- Repeating linear gradient for grain effect
- Stronger inset shadow
- Vintage/printed poster feel

### Supporting Classes
- `.band-logo` - Max 120x80px, contain fit
- `.band-logo-small` - Max 80x60px, contain fit
- `.hero-image-container` - Full width, overflow hidden
- `.hero-image` - Full cover, object-fit
- `.hero-overlay` - Gradient overlay (black/40-50 → 60-70 in dark mode)

---

## 7. Internationalization (i18n)

**Files Updated:**
- `messages/en.json`
- `messages/he.json`

**New Translation Keys:**
```json
{
  "gigpack": {
    "branding": "Branding",
    "brandingDescription": "Customize how your GigPack looks...",
    "bandLogo": "Band Logo (optional)",
    "bandLogoDescription": "Upload a logo image...",
    "heroImage": "Header Image / Poster Art (optional)",
    "heroImageDescription": "Upload a banner or poster image...",
    "accentColor": "Accent Color",
    "accentColorDescription": "Choose a color for highlights...",
    "posterSkin": "Poster Skin",
    "posterSkinDescription": "Choose the background style...",
    "posterSkinClean": "Clean",
    "posterSkinCleanDescription": "Simple solid colors",
    "posterSkinPaper": "Paper",
    "posterSkinPaperDescription": "Subtle paper-like texture",
    "posterSkinGrain": "Grain",
    "posterSkinGrainDescription": "Grainy, vintage feel",
    "uploadImage": "Upload Image",
    "changeImage": "Change",
    "removeImage": "Remove",
    "uploadingImage": "Uploading...",
    "imageUploadError": "Failed to upload image"
  }
}
```

Hebrew translations provided for all keys.

---

## How to Use (For Band Managers)

### 1. Apply Your Migrations

Run these SQL migrations in your Supabase dashboard or CLI:

```bash
# Apply database schema changes
supabase db push

# Or run migrations individually in SQL Editor:
# 1. supabase/migrations/add_branding_fields.sql
# 2. supabase/migrations/create_gigpack_assets_bucket.sql
```

### 2. Create or Edit a GigPack

1. Go to `/gigpacks`
2. Click "Create GigPack" or edit an existing one
3. Scroll to the new **"Branding"** section

### 3. Upload Images

**Band Logo:**
- Click "Upload Image"
- Select a logo (PNG/SVG/JPG recommended)
- Preview appears with Change/Remove options

**Hero/Poster Image:**
- Click "Upload Image"
- Select a banner image (landscape recommended)
- Preview appears with Change/Remove options

### 4. Choose Accent Color

- Click a color swatch for quick selection, OR
- Enter a custom hex color (e.g., `#F97316`)
- Color will be used for highlights throughout the page

### 5. Select Poster Skin

- **Clean**: Modern, simple (default)
- **Paper**: Adds paper-like texture
- **Grain**: Vintage, grainy poster feel

### 6. Save & View

- Click "Save Changes"
- Click "Preview" to see your branded page at `/g/[slug]`

---

## How Branding Works Per Theme

### Minimal Theme
- Logo: Small, centered above title
- Hero: Thin banner at top
- Accent: Section headers, icons, buttons
- Skin: Background of main card

**Best for:** Clean, professional look with subtle branding

---

### Vintage Poster Theme
- Logo: Overlays hero OR in header bar
- Hero: Large poster image behind header
- Accent: **Main header bar, date block, all accents**
- Skin: **Most visible** - paper/grain strongly affects poster feel

**Best for:** Bold, gig poster aesthetic with strong brand presence

**Tips:**
- Use `paper` or `grain` skin for authentic poster look
- Hero image makes a huge visual impact here
- Accent color replaces the default orange throughout

---

### Social Card Theme
- Logo: **Circular avatar** overlapping hero (like social media)
- Hero: Cover image at top
- Accent: Section headers, button highlights
- Skin: Page background

**Best for:** Modern, social media-inspired look

**Tips:**
- Square logo works best (crops to circle)
- Hero image acts as cover photo
- Accent color ties the design together

---

## Customization & Tweaking

### Adjusting Accent Colors

Accent colors are applied via inline `style` attributes:

```tsx
style={{ color: accentColor }}
style={{ borderColor: accentColor }}
style={{ borderColor: accentColor + '40' }} // with opacity
```

**To change default accent:**
- Edit the fallback in each layout component
- Currently: `hsl(38, 92%, 50%)` (orange) for minimal/social
- Vintage defaults to same but can be customized per-GigPack

### Adjusting Poster Skins

**File:** `app/globals.css`

Modify the `.poster-skin-{name}` classes to:
- Change base colors
- Adjust pattern intensity
- Add new skin variants

**To add a new skin:**
1. Add value to `PosterSkin` type in `lib/types.ts`
2. Add radio option in `components/gigpack-form.tsx`
3. Add `.poster-skin-newskin` class in `globals.css`
4. Add translations to `messages/en.json` and `messages/he.json`

### Adjusting Logo Sizes

**Classes in `globals.css`:**
- `.band-logo`: 120x80px (main logo)
- `.band-logo-small`: 80x60px (compact logo)

Increase/decrease `max-width` and `max-height` as needed.

### Adjusting Hero Image Heights

**In layout components:**
- Minimal: `h-48 md:h-64` (12rem / 16rem)
- Vintage: `h-64 md:h-80` (16rem / 20rem)
- Social: `h-48 md:h-64` (12rem / 16rem)

Change Tailwind height classes to adjust.

---

## Files Changed/Created

### Created
1. `supabase/migrations/add_branding_fields.sql`
2. `supabase/migrations/create_gigpack_assets_bucket.sql`
3. `lib/image-upload.ts`
4. `BRANDING-IMPLEMENTATION-SUMMARY.md` (this file)

### Modified
1. `lib/types.ts` - Added branding types
2. `components/gigpack-form.tsx` - Added branding section and upload logic
3. `components/gigpack/layouts/minimal-layout.tsx` - Applied branding
4. `components/gigpack/layouts/vintage-poster-layout.tsx` - Applied branding
5. `components/gigpack/layouts/social-card-layout.tsx` - Applied branding
6. `app/globals.css` - Added poster skin styles
7. `messages/en.json` - Added translations
8. `messages/he.json` - Added translations

---

## Key Implementation Details

### Image Storage Structure

```
gigpack-assets/
  └── {user_id}/
      ├── 1234567890-logo.png
      ├── 1234567891-hero.jpg
      └── ...
```

- Each user has their own folder
- Filenames include timestamps to avoid collisions
- Old images are deleted when replaced

### Accent Color Application

Colors are applied dynamically using inline styles:

```tsx
const accentColor = gigPack.accent_color || "hsl(38, 92%, 50%)";

<div style={{ color: accentColor }}>Header</div>
<Button style={{ borderColor: accentColor }}>Click</Button>
```

Opacity added via string concatenation: `accentColor + '40'`

### Poster Skin Application

Applied via CSS classes:

```tsx
<div className={`poster-skin-${posterSkin}`}>
  {/* content */}
</div>
```

CSS classes use pseudo-selectors for dark mode:

```css
.poster-skin-paper { /* light mode */ }
.dark .poster-skin-paper { /* dark mode */ }
```

### Responsive & Dark Mode

- All branding features work in light and dark modes
- Hero overlays darken in dark mode for contrast
- Poster skins have separate dark mode styles
- Logo sizes adjust on mobile (smaller on smaller screens)
- Accent colors remain high-contrast in both modes

---

## Testing Checklist

- [ ] Upload logo - should preview correctly
- [ ] Upload hero image - should display at top
- [ ] Change images - old image should be replaced
- [ ] Remove images - should clear preview
- [ ] Select color swatches - should update accent
- [ ] Enter custom hex color - should apply accent
- [ ] Select poster skins - should change background texture
- [ ] Save GigPack - all fields should persist
- [ ] View public page (minimal) - branding should appear
- [ ] View public page (vintage_poster) - header should use accent color
- [ ] View public page (social_card) - logo should be circular
- [ ] Test dark mode - all elements should look good
- [ ] Test mobile - responsive layout should work
- [ ] Test in Hebrew locale - translations should display

---

## Future Enhancements (Optional)

1. **Font Selection**: Allow custom fonts per GigPack
2. **Background Patterns**: More poster skin options
3. **Logo Position**: Let user choose logo placement
4. **Color Palette**: Save multiple brand colors
5. **Image Cropping**: Built-in crop tool for uploads
6. **Design Presets**: Pre-made branding templates
7. **Export Options**: Download as image/PDF with branding

---

## Notes

- All branding fields are **optional** - GigPacks work fine without any branding
- Existing GigPacks automatically get default values (null) for new fields
- No breaking changes - everything is backward compatible
- Storage bucket is public for viewing, but uploads require authentication
- Image uploads are validated for size (5MB max) and type
- File cleanup happens automatically when images are replaced or removed

---

## Support & Troubleshooting

### Images Not Uploading
- Check Supabase Storage bucket exists and is public
- Verify RLS policies allow authenticated users to upload
- Check browser console for error messages
- Ensure file is under 5MB and is a valid image format

### Accent Color Not Applying
- Verify valid hex/rgb/hsl format (e.g., `#F97316`)
- Check browser dev tools for inline style attributes
- Ensure GigPack has been saved after color change

### Poster Skin Not Showing
- Check CSS classes are applied to correct elements
- Verify `poster_skin` field is saved in database
- Clear browser cache if styles seem stale

### Dark Mode Issues
- Check `.dark` selector styles in `globals.css`
- Verify overlays have proper opacity for readability
- Test accent colors for sufficient contrast

---

**Implementation Complete!** 🎉

All band branding and poster skin features are now live. Managers can fully customize their GigPack pages with logos, hero images, accent colors, and background textures to match their band's visual identity.

