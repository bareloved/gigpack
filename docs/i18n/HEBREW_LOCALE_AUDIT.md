# Hebrew Locale Audit Report

**Date**: December 12, 2025  
**Scope**: Hebrew (`/he`) locale strings and font configuration  
**Goal**: Identify all English UI/system text in `/he` and apply Google Sans font for Hebrew UI

---

## Executive Summary

The GigPack app has a robust i18n foundation using `next-intl` with comprehensive Hebrew translations in `messages/he.json`. However, **hard-coded English strings** exist in several client components that bypass the translation system. Additionally, **no Hebrew-specific font** is currently configured.

### Findings Overview
- **Hard-coded strings found**: ~50+ instances across 5 key components
- **Missing i18n keys**: ~35 new keys needed
- **Font configuration**: No Hebrew-specific font; Google Sans needs to be applied
- **User content**: Correctly preserved (gig names, band names, venues, etc.)

---

## 1. Hard-Coded English Strings by Component

### 1.1 Top Navigation (`components/app-header.tsx`)

| Line | Current English String | Proposed Hebrew Translation | Context | Priority |
|------|------------------------|----------------------------|---------|----------|
| 22 | "Gigs" | "הופעות" | Nav item label | HIGH |
| 27 | "Bands" | "להקות" | Nav item label | HIGH |
| 68 | "Go to GigPack home" | "עבור לדף הבית של GigPack" | aria-label | MEDIUM |
| 109 | "Search your gigs and bands..." | "חפש הופעות ולהקות..." | Search placeholder | HIGH |

**Implementation**: Add to `messages/he.json` under `"navigation"` section

---

### 1.2 Gigs List View (`app/[locale]/gigpacks/client-page.tsx`)

#### Time Period Labels (Section Headers)
| Line | Current English String | Proposed Hebrew Translation | Context |
|------|------------------------|----------------------------|---------|
| 207 | "Past Gigs" | "הופעות קודמות" | Section header |
| 216 | "This Week" | "השבוע" | Section header |
| 218 | "Later This Month" | "מאוחר יותר החודש" | Section header |
| 222 | "Other Upcoming" | "קרובים אחרים" | Section header |
| 230 | "Upcoming (Unscheduled)" | "קרובים (לא מתוזמנים)" | Section header |

#### View Mode Controls
| Line | Current English String | Proposed Hebrew Translation | Context |
|------|------------------------|----------------------------|---------|
| 480 | "Board" | "לוח" | View toggle |
| 491 | "List" | "רשימה" | View toggle |
| 503 | "Compact" | "דחוס" | View toggle |

#### Filter Pills
| Line | Current English String | Proposed Hebrew Translation | Context |
|------|------------------------|----------------------------|---------|
| 518 | "All" | "הכל" | Filter pill |
| 519 | "Upcoming" | "קרובים" | Filter pill |
| 520 | "Past" | "עבר" | Filter pill |

#### Status/Call-to-Action Text
| Line | Current English String | Proposed Hebrew Translation | Context |
|------|------------------------|----------------------------|---------|
| 583 | "Today" | "היום" | Next-up strip |
| 583 | "Next up" | "הבא בתור" | Next-up strip |
| 587 | "Call" | "הגעה" | Call time prefix |
| 588 | "at" | "ב-" | Venue prefix |
| 613 | "No past gigs found." | "לא נמצאו הופעות קודמות." | Empty state |
| 614 | "No upcoming gigs." | "אין הופעות קרובות." | Empty state |
| 619 | "Pack your first gig" | "ארוז את ההופעה הראשונה שלך" | Empty state CTA |
| 693, 699 | "Today" | "היום" | Date badge (duplicate) |
| 699 | "Call:" | "הגעה:" | Call time label |
| 1264 | "gigs" | "הופעות" | Count label |
| 1265 | "(filtered)" | "(מסונן)" | Search indicator |

#### Tooltips & Accessibility
| Line | Current English String | Proposed Hebrew Translation | Context |
|------|------------------------|----------------------------|---------|
| 740 | "Copy shareable gig link for your band" | "העתק קישור להופעה לשיתוף עם הלהקה" | Tooltip |
| 723 | "Edit" | "ערוך" | Button label (duplicate key exists) |
| 736 | "Share" | "שתף" | Button label (duplicate key exists) |
| 890, 892 | "Edit", "Share" | "ערוך", "שתף" | Dropdown items |
| 896 | "Delete" | "מחק" | Dropdown item |

**Implementation**: Add to `messages/he.json` under new `"gigsList"` section

---

### 1.3 Public Gig View (`components/public-gigpack-view.tsx`)

| Line | Current English String | Proposed Hebrew Translation | Context |
|------|------------------------|----------------------------|---------|
| 166 | "Rehearsal Mode" | "מצב חזרות" | sr-only label |
| 171 | "Rehearsal Mode" | "מצב חזרות" | Tooltip title |
| 172 | "Stage-optimized view" | "תצוגה מותאמת לבמה" | Tooltip description |
| 187 | "Active" | "פעיל" | Polling status |
| 187 | "Idle" | "לא פעיל" | Polling status |
| 194 | "Live" | "חי" | Mobile polling status |

**Implementation**: Add to `messages/he.json` under `"public"` section (already exists, extend it)

---

### 1.4 Language Switcher (`components/language-switcher.tsx`)

| Line | Current English String | Proposed Hebrew Translation | Context |
|------|------------------------|----------------------------|---------|
| 35 | "Switch language" | "החלף שפה" | aria-label |
| 44 | "Switch to {nextLanguage}" | "עבור ל{nextLanguage}" | Tooltip text |

**Implementation**: Add to `messages/he.json` under new `"languageSwitcher"` section

---

### 1.5 Theme Toggle (`components/theme-toggle.tsx`)

| Line | Current English String | Proposed Hebrew Translation | Context |
|------|------------------------|----------------------------|---------|
| 40 | "Toggle theme" | "החלף עיצוב" | sr-only label |
| 45 | "Light Mode" | "מצב בהיר" | Tooltip |
| 45 | "Dark Mode" | "מצב כהה" | Tooltip |
| 48 | "Switch to {theme} theme" | "עבור למצב {theme}" | Tooltip text |

**Implementation**: Add to `messages/he.json` under new `"themeToggle"` section

---

## 2. Font Configuration

### Current State
- **English**: Uses Zalando Sans SemiExpanded (custom web font)
- **Hebrew**: Falls back to system fonts (Heebo via default stack)
- **Issue**: No consistent, branded font for Hebrew UI text

### Proposed Solution
- **Font**: Google Sans (or Noto Sans Hebrew as fallback)
- **Scope**: Apply ONLY to Hebrew locale (`/he` routes)
- **Method**: Locale-scoped CSS variable or `lang` attribute selector
- **Fallback chain**: `"Google Sans", "Noto Sans Hebrew", "Heebo", system-ui, sans-serif`

### Implementation Strategy
1. Load Google Sans via Google Fonts CDN (or self-host)
2. Add font-face declarations in `app/globals.css`
3. Create locale-specific font class: `.locale-he { font-family: ... }`
4. Apply class to `<html>` or `<body>` based on locale
5. Ensure no layout shifts by matching metrics closely

---

## 3. Translation Keys to Add

### New Keys Required in `messages/he.json`

```json
{
  "navigation": {
    "gigs": "הופעות",
    "bands": "להקות",
    "homeAriaLabel": "עבור לדף הבית של GigPack",
    "searchPlaceholder": "חפש הופעות ולהקות..."
  },
  
  "gigsList": {
    "sectionPastGigs": "הופעות קודמות",
    "sectionThisWeek": "השבוע",
    "sectionLaterThisMonth": "מאוחר יותר החודש",
    "sectionOtherUpcoming": "קרובים אחרים",
    "sectionUnscheduled": "קרובים (לא מתוזמנים)",
    
    "viewBoard": "לוח",
    "viewList": "רשימה",
    "viewCompact": "דחוס",
    
    "filterAll": "הכל",
    "filterUpcoming": "קרובים",
    "filterPast": "עבר",
    
    "today": "היום",
    "nextUp": "הבא בתור",
    "callPrefix": "הגעה",
    "atVenue": "ב-",
    
    "emptyPast": "לא נמצאו הופעות קודמות.",
    "emptyUpcoming": "אין הופעות קרובות.",
    "emptyCtaFirst": "ארוז את ההופעה הראשונה שלך",
    
    "callLabel": "הגעה:",
    "gigsCount": "הופעות",
    "filtered": "(מסונן)",
    
    "tooltipShare": "העתק קישור להופעה לשיתוף עם הלהקה"
  },
  
  "publicView": {
    "rehearsalMode": "מצב חזרות",
    "stageView": "תצוגה מותאמת לבמה",
    "statusActive": "פעיל",
    "statusIdle": "לא פעיל",
    "statusLive": "חי"
  },
  
  "languageSwitcher": {
    "ariaLabel": "החלף שפה",
    "switchTo": "עבור ל{language}"
  },
  
  "themeToggle": {
    "ariaLabel": "החלף עיצוב",
    "lightMode": "מצב בהיר",
    "darkMode": "מצב כהה",
    "switchTo": "עבור למצב {theme}"
  }
}
```

**Note**: Also add corresponding English keys to `messages/en.json` for consistency.

---

## 4. Implementation Plan

### Phase 1: Translation Keys (Priority: HIGH)
1. ✅ Add new keys to `messages/en.json`
2. ✅ Add new keys to `messages/he.json`
3. ✅ Update `app-header.tsx` to use `useTranslations()`
4. ✅ Update `client-page.tsx` to use `useTranslations()`
5. ✅ Update `public-gigpack-view.tsx` to use `useTranslations()`
6. ✅ Update `language-switcher.tsx` to use `useTranslations()`
7. ✅ Update `theme-toggle.tsx` to use `useTranslations()`

### Phase 2: Font Configuration (Priority: HIGH)
1. ✅ Load Google Sans font
2. ✅ Add font-face rules to `app/globals.css`
3. ✅ Create locale-scoped font application
4. ✅ Test font loading and fallback
5. ✅ Verify no layout shifts in `/he`

### Phase 3: Verification (Priority: CRITICAL)
1. ✅ Manual test `/he` routes for English strings
2. ✅ Manual test `/en` routes (no changes)
3. ✅ Test RTL layout (should be unchanged)
4. ✅ Test font rendering in both locales
5. ✅ Verify user content (names, venues) not translated

---

## 5. Testing Checklist

### Routes to Test
- [ ] `/he/gigpacks` - Main gigs list
- [ ] `/he/gigpacks` + search query
- [ ] `/he/bands` - Bands list
- [ ] `/he/g/{slug}` - Public gig view
- [ ] `/he/auth/sign-in` - Auth pages
- [ ] `/he/setlists` - Setlists page

### Elements to Verify (Hebrew locale)
- [ ] Top nav: "Gigs", "Bands", search placeholder
- [ ] View toggles: "Board", "List", "Compact"
- [ ] Filter pills: "All", "Upcoming", "Past"
- [ ] Section headers: "This Week", "Later This Month", etc.
- [ ] Status badges: "Today", "Next up", "Call:"
- [ ] Empty states: "No past gigs found"
- [ ] Tooltips: "Copy shareable gig link..."
- [ ] Public view: "Rehearsal Mode", "Active", "Idle"
- [ ] Language switcher tooltip
- [ ] Theme toggle tooltip
- [ ] Font: Google Sans applied to Hebrew text

### Elements to Verify (English locale)
- [ ] All text remains in English
- [ ] No visual/layout regressions
- [ ] Font remains Zalando Sans SemiExpanded

---

## 6. Notes & Edge Cases

### Do NOT Translate
- ✅ "GigPack" brand name (always English)
- ✅ User-entered gig names
- ✅ User-entered band names
- ✅ User-entered venue names/addresses
- ✅ User-entered notes/descriptions
- ✅ Dates (formatted per locale automatically)
- ✅ Times (formatted per locale automatically)

### Accessibility (a11y)
- ✅ Translate `aria-label` attributes
- ✅ Translate `sr-only` screen reader text
- ✅ Translate tooltip content
- ✅ Preserve semantic HTML structure

### RTL Layout
- ✅ Do NOT change RTL CSS rules
- ✅ Do NOT change spacing/layout
- ✅ Only change text content

### Font Fallback
- ✅ Ensure graceful degradation if Google Sans fails to load
- ✅ Test offline/slow network scenarios
- ✅ Maintain readability with system fonts

---

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing hard-coded strings | Medium | Thorough manual testing of all routes |
| Font loading failure | Low | Robust fallback chain |
| Layout shift from font change | Medium | Match font metrics closely, test thoroughly |
| Accidental translation of user content | HIGH | Clear filtering logic in components |
| Breaking `/en` locale | HIGH | No changes to English keys or logic |

---

## Approval

**Reviewer**: _________________  
**Date**: _________________  
**Status**: ⬜ Approved  ⬜ Needs Revision

---

**End of Audit Report**

