# Debug Poster Skin Not Working

## Quick Checklist

### 1. Is the value saving to database?

```sql
-- Run this in Supabase SQL Editor
SELECT id, title, poster_skin FROM gig_packs ORDER BY updated_at DESC LIMIT 5;
```

Expected: You should see `clean`, `paper`, or `grain` values

### 2. Is the CSS class being applied?

On the public page (`/g/[slug]`):
- Open DevTools (F12)
- Find the main card element
- Look for class containing `poster-skin-grain` (or paper/clean)

### 3. Is the CSS loading?

In DevTools:
- Go to **Elements** tab
- Find an element with `poster-skin-grain` class
- In the **Styles** panel, check if you see:
  ```css
  .poster-skin-grain {
    background-color: hsl(40, 25%, 95%) !important;
    background-image: ... !important;
  }
  ```

## If Value Not Saving

Check the form submission in `components/gigpack-form.tsx`:

1. Open DevTools → **Network** tab
2. Edit GigPack and change poster skin
3. Click "Save Changes"
4. Look for the PUT/PATCH request
5. Check the payload includes: `"poster_skin": "grain"`

## If CSS Class Not Applied

The issue is in the layout component. Check:

**Minimal Layout:**
```tsx
<Card className={`... poster-skin-${posterSkin}`}>
```

**Vintage Layout:**
```tsx
<div className={`... poster-skin-${posterSkin} ...`}>
```

**Social Layout:**
```tsx
<div className={`... poster-skin-${posterSkin}`}>
```

## If CSS Not Loading

The `!important` flags should fix this, but if not:

### Option 1: More Specific Selectors

Edit `app/globals.css` and make selectors more specific:

```css
/* Instead of just .poster-skin-grain */
.poster-skin-grain,
[class*="poster-skin-grain"] {
  background-color: hsl(40, 25%, 95%) !important;
  /* ... */
}
```

### Option 2: Inline Styles (Nuclear Option)

If CSS specificity is the issue, use inline styles instead.

In each layout file, replace the className approach with inline styles:

```tsx
// Instead of:
<Card className={`poster-skin-${posterSkin}`}>

// Use:
<Card style={getPosterSkinStyles(posterSkin)}>

// Add helper function:
function getPosterSkinStyles(skin: string) {
  switch(skin) {
    case 'paper':
      return {
        backgroundColor: 'hsl(45, 30%, 98%)',
        backgroundImage: `
          linear-gradient(45deg, transparent 48%, hsl(45, 20%, 92%) 49%, hsl(45, 20%, 92%) 51%, transparent 52%),
          linear-gradient(-45deg, transparent 48%, hsl(45, 20%, 92%) 49%, hsl(45, 20%, 92%) 51%, transparent 52%)
        `,
        backgroundSize: '3px 3px',
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
      };
    case 'grain':
      return {
        backgroundColor: 'hsl(40, 25%, 95%)',
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(40, 20%, 90%) 2px, hsl(40, 20%, 90%) 4px),
          repeating-linear-gradient(90deg, transparent, transparent 2px, hsl(40, 20%, 88%) 2px, hsl(40, 20%, 88%) 4px)
        `,
        backgroundSize: '4px 4px',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.08)',
      };
    default:
      return {};
  }
}
```

## Visual Test

Here's what each should look like:

**Clean (default):**
- Plain solid background
- No texture

**Paper:**
- Very subtle crosshatch pattern
- Slight off-white/cream tone (light mode)
- Barely visible - look closely!

**Grain:**
- More visible grid pattern
- Slightly darker/warmer tone
- Should be clearly different from clean

## Still Not Working?

Share these details:
1. Screenshot of DevTools showing the element's classes
2. Screenshot of DevTools Styles panel
3. Result of the SQL query above
4. Which theme you're using (minimal/vintage/social)




