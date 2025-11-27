# Rehearsal Mode / Stage View Implementation

## Overview

Added a **Rehearsal Mode / Stage View** to the public GigPack page (`/g/[slug]`) that provides a high-contrast, large-font, stage-optimized view for musicians during rehearsals and live performances.

This is a **UI-only feature** with:
- ✅ No database schema changes
- ✅ No RLS changes
- ✅ Just client-side state, styling, and localStorage persistence

---

## What Was Added

### 1. New UI Components

#### **Switch Component** (`components/ui/switch.tsx`)
- shadcn/ui-style switch component using Radix UI
- Used for the Rehearsal Mode toggle

#### **RehearsalView Component** (`components/gigpack/rehearsal-view.tsx`)
- **Purpose**: Stage-optimized layout with large fonts and high contrast
- **Key Features**:
  - **Large, readable typography** (text-4xl to text-7xl for titles, text-2xl to text-6xl for times)
  - **High contrast design** works in both light and dark modes
  - **Single-column layout** with generous spacing
  - **Emphasizes essential info**:
    - Gig title and band name
    - Date (large display)
    - Call time and on-stage time (in prominent cards)
    - Venue with maps button
    - Setlist (largest focus area)
    - Key logistics: dress code and backline notes
  - **De-emphasizes or hides**:
    - Payment notes (hidden)
    - Parking notes (hidden)
    - Long verbose descriptions
    - Lineup details (hidden)
  - **Works with structured setlists**: Shows sections, song numbers, titles, keys, tempo, and notes in large, readable format
  - **Fully responsive**: Scales appropriately on mobile and desktop

### 2. Updated Components

#### **PublicGigPackView** (`components/public-gigpack-view.tsx`)
**Changes**:
- Added Rehearsal Mode state management
- **localStorage persistence**: Remembers user's choice per gig using key `gigpack_rehearsal_mode_<slug>`
- **URL parameter support**:
  - `?view=stage` forces Rehearsal Mode on page load
  - `?mode=rehearsal` also forces Rehearsal Mode
  - URL params override localStorage
- Added toggle control in top-right corner (above theme toggle)
- Conditionally renders either:
  - `<RehearsalView>` when Rehearsal Mode is ON
  - Normal theme layout when Rehearsal Mode is OFF

**Toggle UI**:
- Positioned in top-right corner, next to the dark mode toggle
- Eye icon button (ghost style)
- Tooltip on hover using Radix UI:
  - Shows "Rehearsal Mode" as main text
  - Shows "Stage-optimized view" as subtext
- Visual states:
  - **OFF**: Muted gray eye icon
  - **ON**: Primary color filled eye icon
- Matches the design pattern of the dark mode toggle

### 3. Translations

Added to both `messages/en.json` and `messages/he.json`:
```json
"public": {
  "rehearsalMode": "Rehearsal Mode" / "מצב חזרות",
  "stageOptimizedView": "Stage-optimized view" / "תצוגה מותאמת לבמה",
  "callTime": "Call Time" / "זמן קריאה",
  "onStage": "On Stage" / "על הבמה",
  "essentialInfo": "Essential Info" / "מידע חיוני"
}
```

---

## How It Works

### User Flow

1. **User visits public GigPack page**: `/g/[slug]`
2. **Toggle control is visible** in top-right corner
3. **User toggles Rehearsal Mode ON**:
   - Page immediately switches to stage-optimized layout
   - Preference is saved to localStorage
4. **User refreshes page**: Rehearsal Mode state is restored from localStorage
5. **User toggles Rehearsal Mode OFF**: Returns to normal themed view

### Persistence

**localStorage Key**: `gigpack_rehearsal_mode_<slug>`
- Stored as `"true"` or `"false"`
- Checked on initial component mount
- Updated whenever toggle state changes
- **Per-gig basis**: Each GigPack remembers its own setting

### Deep-Linking to Stage View

Managers can share direct links to Rehearsal Mode:

**Examples**:
- `https://yoursite.com/g/friday-night-jazz?view=stage`
- `https://yoursite.com/g/friday-night-jazz?mode=rehearsal`

URL param overrides localStorage and forces Rehearsal Mode on initial load.

---

## Files Created/Modified

### Created
1. `components/ui/tooltip.tsx` - Tooltip UI component (Radix UI)
2. `components/gigpack/rehearsal-view.tsx` - Rehearsal Mode layout
3. `REHEARSAL-MODE-IMPLEMENTATION.md` - This documentation

### Modified
1. `components/public-gigpack-view.tsx` - Added toggle and state management
2. `messages/en.json` - Added English translations
3. `messages/he.json` - Added Hebrew translations
4. `package.json` - Added `@radix-ui/react-tooltip` dependency
5. `package-lock.json` - Lockfile update

---

## Cross-Theme Compatibility

Rehearsal Mode **works across all themes** (minimal, vintage_poster, social_card):
- Implemented as a **higher-level view mode** that wraps the entire page
- When ON: Uses RehearsalView component (consistent across all themes)
- When OFF: Uses the selected theme's normal layout
- **Accent color** from branding is respected in Rehearsal Mode
- **Dark/light mode** works properly via theme provider

---

## Typography & Design Decisions

### Font Sizes (Rehearsal Mode)

| Element | Mobile | Desktop | Purpose |
|---------|--------|---------|---------|
| Gig Title | text-4xl | text-6xl/7xl | Maximum visibility |
| Band Name | text-xl | text-3xl | Secondary info |
| Date | text-3xl | text-5xl | Important timing |
| Call/Stage Time | text-4xl | text-6xl | Critical timing info |
| Venue Name | text-xl | text-2xl | Context |
| Setlist Section Headers | text-base | text-lg | Section dividers |
| Song Numbers | text-2xl | text-4xl | Navigation aid |
| Song Titles | text-2xl | text-4xl | Main content |
| Song Meta (key/tempo) | text-base | text-xl | Supporting info |
| Notes | text-base | text-lg | Watch-outs |

### Color & Contrast
- **High contrast** by default (works in light/dark mode)
- **Accent color** used for:
  - Section borders
  - Song numbers
  - Time cards
  - Keys (emphasized)
- **Muted backgrounds** for cards to reduce glare
- **Bold fonts** throughout for readability

### Spacing
- **Generous padding**: 6-12 on mobile, 8-12 on desktop
- **Large gaps**: 6-8 between sections
- **Whitespace**: Prevents visual clutter

---

## What's Visible in Rehearsal Mode

### ✅ Shown (Emphasized)
- Gig title and band name
- Date
- Call time (if set)
- On-stage time (if set)
- Venue name and address
- Maps button (if maps URL provided)
- **Setlist** (largest focus):
  - Structured setlist with sections, songs, keys, tempo, notes
  - OR simple text setlist (fallback)
- Dress code
- Backline notes

### ❌ Hidden (De-emphasized)
- Band logo
- Hero image
- Lineup details
- Parking notes
- Payment notes
- Internal notes (already private)
- Long verbose descriptions

---

## Adjusting What's Visible

To modify which sections appear in Rehearsal Mode, edit `components/gigpack/rehearsal-view.tsx`:

1. **To hide a section**: Remove or comment out the JSX block
2. **To show a section**: Add JSX rendering the field from `gigPack` prop
3. **To reorder sections**: Move JSX blocks around

Example - Add parking notes to Rehearsal Mode:

```tsx
{gigPack.parking_notes && (
  <div className="bg-muted/50 border rounded-xl p-5 md:p-6">
    <div className="flex items-center gap-2 text-sm md:text-base uppercase tracking-wider font-semibold text-muted-foreground mb-3">
      <ParkingCircle className="h-5 w-5" />
      <span>{t("parking")}</span>
    </div>
    <p className="text-base md:text-xl font-medium whitespace-pre-wrap leading-relaxed">
      {gigPack.parking_notes}
    </p>
  </div>
)}
```

---

## Responsive Behavior

### Mobile (< 768px)
- Single column layout
- Smaller font sizes (still large enough to read easily)
- Call time and on-stage time stack vertically
- Touch-friendly controls

### Desktop (≥ 768px)
- Wider container (max-w-5xl)
- Larger font sizes for viewing from distance
- Call time and on-stage time side-by-side
- More generous spacing

---

## Testing Checklist

### ✅ Functionality
- [x] Toggle switches between normal and Rehearsal Mode
- [x] localStorage persists preference across page reloads
- [x] URL params (`?view=stage`, `?mode=rehearsal`) force Rehearsal Mode
- [x] Works across all themes (minimal, vintage_poster, social_card)
- [x] Dark mode toggle still works in Rehearsal Mode
- [x] Auto-update indicator still visible
- [x] Structured setlist renders correctly
- [x] Fallback text setlist renders correctly

### ✅ Responsive Design
- [x] Mobile: readable and usable
- [x] Desktop: optimized for viewing from 1-2 meters away
- [x] Font scaling works properly

### ✅ Localization
- [x] English translations work
- [x] Hebrew translations work
- [x] RTL layout respected

---

## Future Enhancements (Optional)

Potential improvements you could add later:

1. **Print-optimized CSS**: Add `@media print` styles for printing setlists
2. **Font size adjustment**: Allow users to increase/decrease base font size
3. **Full-screen mode**: Add button to enter browser full-screen
4. **Notes visibility toggle**: Allow hiding/showing song notes in Rehearsal Mode
5. **Auto-scroll**: Auto-scroll through setlist during performance
6. **Metronome integration**: Add click track for tempo-marked songs
7. **Lyrics display**: Show lyrics for songs (requires DB schema change)
8. **Next song preview**: Highlight upcoming song in setlist

---

## Technical Notes

### State Management
- Uses React `useState` for toggle state
- `useEffect` for localStorage sync
- `useSearchParams` for URL param detection
- Client-side only (no server state)

### Performance
- No additional API calls introduced
- Same data fetching as normal view
- localStorage is synchronous (instant read/write)
- No layout shift when toggling

### Accessibility
- Toggle has proper labels and ARIA attributes
- High contrast meets WCAG guidelines
- Large fonts aid readability
- Keyboard navigation works

---

## Summary

Rehearsal Mode is now fully implemented and ready to use! Musicians can:
- Toggle to stage view with one click
- Have their preference remembered
- Deep-link directly to Rehearsal Mode
- View all essential gig info in a large, readable format
- Focus on the setlist and key logistics

No backend changes were needed—it's all client-side UI magic! 🎸

