# Setlist v2 Implementation Summary

## Overview

Successfully implemented **Setlist v2** - a structured setlist system for GigPack that replaces the simple text field with a musician-focused, section-based editor and beautiful "printed setlist" rendering on public pages.

---

## What Changed

### 1. Database Schema

**New Column:** `setlist_structured` (JSONB, nullable)

- **Migration File:** `supabase/migrations/add_setlist_structured.sql`
- **Structure:**
  ```typescript
  SetlistSection[] = [
    {
      id: string,
      name: string, // e.g. "Set 1", "Encore"
      songs: [
        {
          id: string,
          title: string,
          artist?: string,
          key?: string,
          tempo?: string,
          notes?: string,
          referenceUrl?: string // for future use
        }
      ]
    }
  ]
  ```

**Backwards Compatibility:**
- The old `setlist` text field remains intact
- Public views fall back to `setlist` if `setlist_structured` is missing
- No data migration required - existing GigPacks continue to work

---

### 2. TypeScript Types

**Updated:** `lib/types.ts`

**New Types:**
- `SetlistSong` - Individual song with metadata
- `SetlistSection` - Section containing songs

**Updated Type:**
- `GigPack` interface now includes `setlist_structured: SetlistSection[] | null`

---

### 3. Manager UI - Setlist Editor

**New Component:** `components/setlist-editor.tsx`

**Features:**
- **Section Management:**
  - Add/remove sections
  - Rename sections (default: "Set 1", "Set 2", etc.)
  - Reorder sections with up/down buttons
  
- **Song Management:**
  - Add/remove songs within sections
  - Reorder songs with up/down buttons
  - Song numbering displayed per section
  
- **Song Fields:**
  - Title (required, primary input)
  - Artist (optional, inline)
  - Key (optional, inline)
  - Tempo (optional, inline)
  - Notes (optional, expandable textarea)
  
- **UX Details:**
  - Clean, card-based layout using shadcn/ui components
  - Compact inline fields for quick editing
  - Expandable notes section to avoid clutter
  - Disabled state support for loading
  - Auto-initializes with one default section ("Set 1")

**Integration:**
- Wired into `components/gigpack-form.tsx`
- Replaces the old setlist textarea
- Saves/loads `setlist_structured` to/from Supabase

---

### 4. Public View Rendering

**New Component:** `components/structured-setlist.tsx`

**Purpose:** 
Renders structured setlists in a "printed setlist" style with theme variations.

**Features:**
- **Global Song Numbering:** Songs numbered continuously across all sections
- **Section Headers:** Clearly marked section names
- **Song Display:**
  - Title (bold, prominent)
  - Artist, Key, Tempo (inline metadata, dimmed)
  - Notes (smaller text below song, prefixed with →)
- **Three Visual Variants:**
  - `minimal` - Clean list with simple section labels
  - `vintage` - Stamp-style section headers, paper-like containers
  - `social` - Pill-style section headers, card containers
- **Responsive:** Mobile-friendly with adjusted font sizes
- **Theme Support:** Accepts accent color for consistent branding

---

### 5. Updated Layout Components

**Modified Files:**
- `components/gigpack/layouts/minimal-layout.tsx`
- `components/gigpack/layouts/vintage-poster-layout.tsx`
- `components/gigpack/layouts/social-card-layout.tsx`

**Changes:**
- Check for `setlist_structured` first
- If present, render with `<StructuredSetlist />`
- If missing, fall back to old text setlist rendering
- Maintains theme-specific styling

**Theme Variations:**

**Minimal:**
- Clean section labels with subtle borders
- Tight spacing, modern typography
- Song metadata inline on the right

**Vintage Poster:**
- Bold stamp-style section headers with accent color
- Paper-textured container with inner shadow
- Stronger typography (font-black for numbers)
- Tighter line spacing for "taped-up setlist" feel

**Social Card:**
- Pill-shaped section badges with accent color
- Soft card containers with muted backgrounds
- Metadata shown inline with subtle separators

---

## How to Use

### For Managers (Creating/Editing GigPacks)

1. **Open GigPack Form:** Navigate to create or edit a GigPack
2. **Find "Music / Setlist" Section:** The old textarea has been replaced with the Setlist Editor
3. **Add Sections:**
   - Click "Add Section" to create Set 2, Encore, etc.
   - Rename sections by editing the section name input
   - Reorder sections with up/down arrows
4. **Add Songs:**
   - Click "Add Song" within a section
   - Fill in song title (required)
   - Optionally add artist, key, tempo
   - Click "Add Notes" to add rehearsal notes
5. **Reorder Songs:** Use up/down arrows next to each song
6. **Save:** Submit the form as usual - `setlist_structured` is saved automatically

### For Musicians (Public View)

1. **Visit GigPack Link:** `/g/[slug]`
2. **Scroll to Setlist Section**
3. **View Structured Setlist:**
   - Sections are clearly marked (Set 1, Set 2, Encore)
   - Songs are numbered globally (01, 02, 03...)
   - Key and tempo shown inline for quick reference
   - Rehearsal notes displayed below songs in smaller text
4. **Responsive:** Works great on mobile and desktop
5. **Theme-Aware:** Setlist styling matches the GigPack's theme

---

## Technical Details

### Data Flow

```
Manager Input (SetlistEditor)
  → State: setlistStructured (SetlistSection[])
  → Form Submit
  → Supabase: gig_packs.setlist_structured (JSONB)
  → Public View
  → StructuredSetlist Component
  → Theme-specific rendering
```

### Backwards Compatibility

- **Old GigPacks:** Continue to use `setlist` text field
- **New GigPacks:** Use `setlist_structured` by default
- **Public View:** Automatically detects and renders appropriately
- **No Breaking Changes:** All existing functionality preserved

### Responsive Design

- **Manager UI:**
  - Song fields stack on mobile
  - Section controls remain accessible
  - Touch-friendly buttons
  
- **Public View:**
  - Font sizes adjust for mobile (text-sm → md on larger screens)
  - Metadata wraps gracefully
  - Section headers remain prominent
  - Notes text readable on small screens

### Dark Mode Support

All components respect theme settings:
- Manager editor uses muted backgrounds
- Public view uses theme-aware colors
- Border colors adjust automatically
- Accent colors remain vibrant in both modes

---

## Customization Guide

### Adjusting the "Printed Setlist" Look

#### Change Section Header Style

Edit `components/structured-setlist.tsx`:

```typescript
// Find the section header rendering for your variant
// Example for vintage variant:
<div className="px-3 py-1.5 rounded border" 
     style={{ backgroundColor: accentColor + '15', borderColor: accentColor + '40' }}>
  <div className="text-xs uppercase tracking-[0.15em] font-black" 
       style={{ color: accentColor }}>
    {section.name}
  </div>
</div>
```

**Customization Options:**
- Change `tracking-[0.15em]` for letter spacing
- Adjust padding: `px-3 py-1.5`
- Modify border radius: `rounded` → `rounded-lg`
- Change text size: `text-xs` → `text-sm`

#### Change Song Numbering Style

```typescript
// Find the song number span in your variant
<span className="font-black min-w-[2rem] text-xs md:text-sm tabular-nums flex-shrink-0" 
      style={{ color: accentColor }}>
  {String(globalSongNumber).padStart(2, '0')}.
</span>
```

**Customization Options:**
- Remove zero-padding: `.padStart(2, '0')` → just `globalSongNumber`
- Change font weight: `font-black` → `font-bold`
- Adjust width: `min-w-[2rem]` → `min-w-[3rem]`
- Change numbering format: Add brackets `[01]` or parentheses `(01)`

#### Adjust Song Title Typography

```typescript
<span className="flex-1 font-bold text-sm md:text-base text-foreground">
  {song.title}
</span>
```

**Customization Options:**
- Font weight: `font-bold` → `font-semibold` or `font-extrabold`
- Size: `text-sm md:text-base` → `text-base md:text-lg`
- Transform: Add `uppercase` or `capitalize`
- Tracking: Add `tracking-tight` or `tracking-wide`

#### Modify Notes Display

```typescript
{song.notes && (
  <div className="mt-1.5 ml-8 text-xs text-muted-foreground italic">
    → {song.notes}
  </div>
)}
```

**Customization Options:**
- Change prefix: `→` → `•` or `Note:`
- Adjust indent: `ml-8` → `ml-6` or `ml-10`
- Font style: Remove `italic` or change to `font-light`
- Background: Add `bg-muted/30 p-2 rounded` for highlighted notes

#### Add New Theme Variant

1. **Add to `StructuredSetlist` component:**

```typescript
if (variant === "mynewtheme") {
  return (
    <div className="space-y-4">
      {/* Your custom rendering */}
    </div>
  );
}
```

2. **Update layout component:**

```typescript
<StructuredSetlist 
  sections={gigPack.setlist_structured} 
  variant="mynewtheme"
  accentColor={accentColor}
/>
```

---

## Files Changed

### Created Files
- ✅ `supabase/migrations/add_setlist_structured.sql` - Database migration
- ✅ `components/setlist-editor.tsx` - Manager UI component
- ✅ `components/structured-setlist.tsx` - Public view renderer
- ✅ `SETLIST-V2-IMPLEMENTATION.md` - This document

### Modified Files
- ✅ `lib/types.ts` - Added SetlistSong, SetlistSection types
- ✅ `components/gigpack-form.tsx` - Integrated SetlistEditor
- ✅ `components/gigpack/layouts/minimal-layout.tsx` - Added structured rendering
- ✅ `components/gigpack/layouts/vintage-poster-layout.tsx` - Added structured rendering
- ✅ `components/gigpack/layouts/social-card-layout.tsx` - Added structured rendering

---

## Migration Instructions

### Apply Database Migration

```bash
# If using Supabase CLI locally:
supabase db reset

# Or run the migration file manually in Supabase Dashboard SQL Editor:
# Copy content from supabase/migrations/add_setlist_structured.sql
```

### No Data Migration Needed

- Existing GigPacks with text setlists will continue to work
- Users can manually migrate by:
  1. Opening the GigPack in edit mode
  2. Viewing the old text setlist (still there in DB)
  3. Rebuilding it in the new SetlistEditor
  4. Saving (this populates `setlist_structured`)

### Future Considerations

To auto-migrate text setlists to structured format, you could:
1. Create a migration script that parses `setlist` text
2. Attempts to detect sections (e.g. lines with "Set 1", "Encore")
3. Creates a default section if none detected
4. Splits lines into song titles
5. Populates `setlist_structured`

This is **not implemented** in v1 to avoid breaking or misinterpreting data.

---

## Testing Checklist

### Manager UI
- ✅ Create new GigPack with structured setlist
- ✅ Edit existing GigPack (form loads correctly)
- ✅ Add/remove sections
- ✅ Rename sections
- ✅ Reorder sections
- ✅ Add/remove songs
- ✅ Reorder songs within section
- ✅ Fill in all song fields (title, artist, key, tempo, notes)
- ✅ Expand/collapse notes
- ✅ Save and verify data persists

### Public View
- ✅ View GigPack with structured setlist
- ✅ Verify sections render correctly
- ✅ Verify global song numbering
- ✅ Check metadata display (artist, key, tempo)
- ✅ Check notes display
- ✅ Test on mobile (responsive)
- ✅ Test on desktop
- ✅ Test in light mode
- ✅ Test in dark mode
- ✅ Test all three themes (minimal, vintage, social)

### Backwards Compatibility
- ✅ View old GigPack with text setlist (should still render)
- ✅ Edit old GigPack (setlist_structured starts empty, text setlist unchanged)
- ✅ Verify no errors in console

---

## Future Enhancements

### Potential Features (Not Implemented)

1. **Drag-and-Drop Reordering:**
   - Use a library like `dnd-kit` or `react-beautiful-dnd`
   - More intuitive than up/down buttons
   - Would improve UX for large setlists

2. **Import from Text:**
   - Paste a text setlist
   - Auto-parse into structured format
   - Helpful for migrating existing data

3. **Setlist Templates:**
   - Save/load common setlist structures
   - Share templates between GigPacks
   - Useful for touring bands

4. **Reference URLs per Song:**
   - Already in the type definition
   - Could link to YouTube, Spotify, etc.
   - Needs UI and rendering implementation

5. **Song Duration/Total Time:**
   - Calculate estimated show length
   - Display total duration per section
   - Helpful for planning

6. **Print/PDF Export:**
   - Generate printer-friendly version
   - One-click PDF download
   - Optimized for black & white printing

7. **Collaborative Editing:**
   - Multiple band members edit simultaneously
   - Real-time updates
   - Conflict resolution

8. **Song Library:**
   - Reusable song database
   - Quick-add from library
   - Auto-fill metadata

---

## Support & Troubleshooting

### Common Issues

**Issue:** Setlist Editor doesn't show up
- **Solution:** Clear browser cache, verify migration ran successfully

**Issue:** Old setlists don't display
- **Solution:** Check `setlist` field still exists in DB, verify fallback logic

**Issue:** Songs not saving
- **Solution:** Check console for errors, verify Supabase permissions

**Issue:** Theme styling looks off
- **Solution:** Ensure accent_color is set, check for CSS conflicts

### Debug Mode

To see raw data structure in console:

```typescript
// In SetlistEditor component, add:
console.log('Current setlist structure:', value);

// In StructuredSetlist component, add:
console.log('Rendering sections:', sections);
```

---

## Credits

Implemented as part of GigPack's continuous improvement to provide musicians with the best possible gig information tools. Built with musician feedback in mind, designed to be fast, intuitive, and beautiful.

---

**Version:** 2.0  
**Date:** November 24, 2025  
**Status:** ✅ Complete & Ready for Production

