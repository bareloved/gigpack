# GigPack Design System

## 🎸 Overview

GigPack has been redesigned with a **musician-friendly aesthetic** that evokes gig posters and printed setlists while maintaining modern web app usability. The design works beautifully in low-light environments (rehearsal rooms, stage wings) and provides strong visual hierarchy for quick scanning.

---

## 🎨 Color Palette

### Musician-Friendly Color Scheme

The color palette is inspired by **stage lights**, **gig posters**, and **working musicians' environments**.

#### Light Mode
- **Background**: `hsl(45 20% 97%)` - Warm off-white, easy on the eyes
- **Card**: `hsl(0 0% 100%)` - Pure white for content cards
- **Primary (Amber/Orange)**: `hsl(38 92% 50%)` - Stage lights, gig poster accent
- **Accent (Teal)**: `hsl(174 72% 56%)` - Supporting accent for variety
- **Muted**: `hsl(45 15% 94%)` - Subtle backgrounds
- **Border**: `hsl(45 15% 88%)` - Soft borders

#### Dark Mode
- **Background**: `hsl(222 20% 10%)` - Deep charcoal, perfect for low light
- **Card**: `hsl(222 18% 14%)` - Slightly lighter surface
- **Primary (Amber)**: `hsl(38 92% 55%)` - Vibrant without being neon
- **Accent (Teal)**: `hsl(174 72% 56%)` - Pops in dark mode
- **Muted**: `hsl(222 16% 22%)` - Subtle backgrounds
- **Border**: `hsl(222 16% 24%)` - Visible but not harsh

### Usage Guidelines

- **Primary (Amber)**: Use for CTAs, date pills, important highlights, and decorative accents
- **Accent (Teal)**: Use for time indicators and secondary highlights
- **Muted colors**: Use for supporting text, dividers, and backgrounds

---

## 📐 Typography

### Hierarchy

#### Headlines (h1, h2, h3)
- **Bold tracking**: `tracking-tight` for impact
- **Large sizes**: 
  - h1: `text-4xl md:text-5xl lg:text-6xl`
  - h2: `text-3xl md:text-4xl`
  - h3: `text-2xl md:text-3xl`
- **Usage**: Gig titles, section headers, dashboard title

#### Body Text
- **Base size**: `text-base` (16px)
- **Line height**: Default comfortable spacing
- **Usage**: Descriptions, logistics info, general content

#### Monospace (Setlists)
- **Font**: System monospace stack
- **Usage**: Setlist display for that "printed setlist" feel
- **Styling**: Numbered lines with dividers between songs

### Font Stacks

```css
/* Sans-serif (default) */
font-family: system-ui, -apple-system, BlinkMacSystemFont, 
             "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

/* Monospace (setlists) */
font-family: "SF Mono", Monaco, Inconsolata, "Fira Code", 
             "Droid Sans Mono", monospace;
```

---

## 🧩 Component Patterns

### Gig Card (Dashboard List)

**Visual Style**: Each card looks like a small gig poster

```tsx
// Structure
<Card className="gig-card group">
  <CardContent>
    {/* Large gig title */}
    <h3>Gig Title</h3>
    
    {/* Date & time pills */}
    <div className="date-pill">
      <Calendar /> Date
    </div>
    
    {/* Venue with icon */}
    <div className="border-t border-dashed">
      <MapPin /> Venue
    </div>
    
    {/* Action buttons */}
    <div className="flex gap-2">
      <Button>Edit</Button>
      <Button>Copy</Button>
      <Button>View</Button>
    </div>
  </CardContent>
</Card>
```

**Key Features**:
- Hover effect: scales up slightly (`scale-[1.02]`) with shadow increase
- Date pill: amber background with border
- Call time pill: teal background with clock icon
- Border-dashed dividers between sections

### Date Pill

```css
.date-pill {
  @apply inline-flex items-center rounded-lg 
         bg-primary/10 px-3 py-1.5 
         text-sm font-semibold text-primary 
         border border-primary/20;
}
```

### Section Header

Used throughout forms and public pages for clear section separation:

```css
.gig-section-header {
  @apply text-xs uppercase tracking-wider 
         font-bold text-muted-foreground mb-3 
         flex items-center gap-2;
}
```

Includes:
- Small horizontal line accent (`h-1 w-8 bg-primary`)
- Icon
- Uppercase label

### Section Divider

```css
.section-divider {
  @apply border-t-2 border-dashed border-border my-6;
}
```

---

## 📄 Page Designs

### Dashboard (`/gigpacks`)

**Theme**: Tour book / list of gigs

#### Header
- Decorative horizontal line with "Your Gigs" label
- Large title: "GigPack Dashboard"
- Descriptive subtitle
- Prominent "Create GigPack" button with shadow

#### List View
- Grid layout: 2 columns (md), 3 columns (xl)
- Cards with gig poster aesthetic
- Date and time pills prominent
- Quick actions at bottom

#### Empty State
- Large music icon in colored circle
- Friendly message: "No gigs packed yet"
- Clear CTA button

### Create/Edit Sheet

**Theme**: Organized form with clear sections

#### Sheet Header
- Decorative line accent
- Large title
- Current gig info display (when editing)
- Border-left accent on sheet

#### Form Sections
Each section has:
1. Section header with line accent and icon
2. Card with border-2 for emphasis
3. Dashed dividers between sections

Sections:
- **Core Information**: Date, time, venue details
- **Lineup**: Who's playing (grid inputs)
- **Music / Setlist**: Textarea for songs
- **Logistics**: Dress code, backline, parking, payment

#### Actions Bar
- Sticky at bottom
- Backdrop blur for modern effect
- Border-top with primary accent
- Save/Cancel buttons + Preview/Copy link (when editing)

### Public GigPack Page (`/g/[slug]`)

**Theme**: Gig poster meets printed setlist

#### Main Card
- Large rounded card (`rounded-2xl`)
- Border-4 with primary accent
- Shadow-2xl for depth

#### Header Section
- **Gradient background**: Primary color gradient
- **Decorative corners**: Border elements in corners
- **Massive title**: `text-4xl md:text-6xl lg:text-7xl` ultra-bold
- **Band name**: Prominent below title

#### Date & Times
- Large date pill with calendar icon, centered
- Call time and on-stage time in separate accent-colored cards
- Grid layout on mobile

#### Venue
- Border-left-4 accent
- Large venue name
- Address below
- "Open in Maps" button

#### Lineup
- Grid layout (2 columns on md+)
- Each member: border-left-4 accent card
- Role bold, name below, notes italic
- Hover effect

#### Setlist
- **Printed setlist aesthetic**
- Monospace font
- Numbered lines (1., 2., 3.)
- Border-bottom dashed between songs
- Background: muted with border

#### Logistics
- Grid of info cards (2 columns)
- Border-top-4 accent per card
- Icons with uppercase labels
- Includes: Dress code, Backline, Parking, Payment

#### Footer
- Border-top dashed
- Last updated time
- "Powered by GigPack" branding
- Auto-update indicator

---

## 🌗 Dark Mode

### Design Principles

1. **Deep charcoal background**: `hsl(222 20% 10%)` - perfect for low-light venues
2. **Strong contrast**: White text on dark background
3. **Vibrant accents**: Primary amber pops without being neon
4. **Subtle surfaces**: Cards slightly lighter than background
5. **Visible borders**: Borders visible but not harsh

### Testing

Dark mode is automatically enabled based on system preference. All components are designed to work beautifully in both modes.

**Key areas to verify**:
- Public GigPack page (most important - used in low light)
- Dashboard list cards
- Form sheet
- Button states and hover effects

---

## 🎯 Utility Classes

### Custom Utilities

```css
/* Gig card with hover effect */
.gig-card
.gig-card:hover

/* Date pill styling */
.date-pill

/* Section divider */
.section-divider

/* Section header */
.gig-section-header
```

### Common Patterns

**Card with accent border**:
```tsx
<Card className="border-2" />
```

**Left border accent**:
```tsx
<div className="border-l-4 border-primary" />
```

**Top border accent**:
```tsx
<div className="border-t-4 border-primary" />
```

**Dashed divider**:
```tsx
<div className="border-t-2 border-dashed" />
```

**Muted background section**:
```tsx
<div className="bg-muted/30" />
```

---

## 🎨 Animation

### Transitions

- **Duration**: 150-200ms (snappy, not sluggish)
- **Hover states**: All interactive elements have clear hover feedback
- **Sheet open/close**: Built-in sheet animation
- **Card hover**: Scale + shadow increase

### Custom Animations

```typescript
// Tailwind config
animation: {
  'slide-in': 'slideIn 0.2s ease-out',
}
```

---

## 📱 Responsive Design

### Breakpoints

- **Mobile**: Base styles (default)
- **sm**: 640px (small tablets)
- **md**: 768px (tablets, 2-column layouts start)
- **lg**: 1024px (desktop)
- **xl**: 1280px (large desktop, 3-column layouts)

### Key Responsive Patterns

1. **Dashboard grid**: 
   - Mobile: 1 column
   - md: 2 columns
   - xl: 3 columns

2. **Typography**:
   - Mobile: Smaller heading sizes
   - Desktop: Larger, more impactful

3. **Public page**:
   - Mobile: Full width with padding
   - Desktop: Constrained max-width (`max-w-5xl`)

4. **Logistics cards**:
   - Mobile: Single column
   - md: 2 columns

---

## 🛠 Customization Guide

### Changing the Accent Color

The primary accent (amber) can be changed in `app/globals.css`:

```css
:root {
  /* Change this to your preferred hue */
  --primary: 38 92% 50%; /* Currently amber */
}

.dark {
  --primary: 38 92% 55%; /* Slightly lighter in dark mode */
}
```

**Alternatives**:
- Purple: `270 70% 60%`
- Blue: `220 90% 56%`
- Red: `0 84% 60%`
- Green: `142 76% 36%`

### Adjusting Border Radius

In `app/globals.css`:

```css
:root {
  --radius: 0.75rem; /* Currently 12px */
}
```

Options:
- Sharp: `0.25rem` (4px)
- Medium: `0.5rem` (8px)
- Rounded: `0.75rem` (12px, current)
- Very rounded: `1rem` (16px)

### Typography Scale

Adjust in individual components or create custom classes in Tailwind config.

---

## ✅ Implementation Checklist

### Completed ✓

- [x] Global color tokens (light + dark mode)
- [x] Typography system with strong hierarchy
- [x] Dashboard header with tour book vibe
- [x] Gig card redesign for list view
- [x] Empty state with friendly messaging
- [x] Form sheet with section styling
- [x] Section headers with decorative accents
- [x] Section dividers (dashed borders)
- [x] Public GigPack page - complete redesign
- [x] Gig poster header with gradient
- [x] Date/time pills with strong styling
- [x] Venue section with accent border
- [x] Lineup grid with hover effects
- [x] Setlist with printed aesthetic (numbered, monospace)
- [x] Logistics cards with icons
- [x] Footer with branding
- [x] Dark mode optimization
- [x] Responsive design across all components
- [x] Micro-interactions and hover states

### Future Enhancements

- [ ] Theme selector for public pages (placeholder added)
- [ ] Custom font integration (optional)
- [ ] Additional color scheme options
- [ ] Print stylesheet for physical setlists
- [ ] QR code for easy mobile access

---

## 🚀 Getting Started

The design system is fully implemented. To customize:

1. **Colors**: Edit `app/globals.css` CSS variables
2. **Typography**: Adjust in `tailwind.config.ts` or component-level
3. **Spacing**: Use Tailwind's spacing scale or add custom values
4. **Components**: Extend existing patterns following established conventions

All changes are visual-only. No business logic, routes, or database schema were modified.

---

## 📞 Design Rationale

**Why these choices?**

1. **Amber/Orange accent**: Evokes stage lights and classic gig posters
2. **Dark charcoal background**: Essential for low-light venue environments
3. **Bold typography**: Musicians need to scan info quickly
4. **Numbered setlist**: Matches the printed setlists musicians are used to
5. **Card-based layout**: Clean separation of concerns, scannable
6. **Dashed dividers**: Softer than solid lines, adds texture without noise
7. **Border accents**: Visual hierarchy without color overload
8. **Monospace for setlists**: Reinforces the "printed sheet" aesthetic

This design makes GigPack feel like a **tool built by musicians, for musicians**.


