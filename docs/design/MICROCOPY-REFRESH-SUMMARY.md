# Microcopy Refresh Summary

**Date:** November 24, 2025  
**Goal:** Transform GigPack's language from generic/corporate to friendly, musician-centric tone.

---

## 🎸 Core Tone Principles

The app now "talks like a bandmate":
- **Friendly and casual** — like a fellow musician helping you
- **Gig-life focused** — real band situations, not corporate jargon
- **Short and clear** — easy to parse on a busy gig day
- **Slightly playful** — but not childish

---

## 📝 Key Phrase Changes

### Main Navigation & Actions
| OLD | NEW |
|-----|-----|
| Dashboard | Your gigs |
| Create GigPack | Pack a new gig |
| Edit GigPack | Edit gig |
| GigPack Dashboard | Your gigs |
| Delete | Delete |
| Save Changes | Save changes |

### Form Sections
| OLD | NEW |
|-----|-----|
| Core Information | Gig basics |
| Lineup | Who's playing |
| Music / Setlist | What we're playing |
| Logistics | Don't forget |
| Branding | Band look & feel |
| Design | Page style |

### Field Labels
| OLD | NEW |
|-----|-----|
| Gig Title | Gig name |
| Band / Project Name | Band / Project |
| Call Time | Call time |
| On Stage Time | On stage |
| Venue Name | Venue |
| Venue Address | Address |
| Venue Maps URL | Maps link |
| Add Member | Add another |
| Dress Code | Dress code |
| Backline / Gear Notes | Gear / Backline |
| Parking / Load-in Notes | Parking & Load-in |
| Payment Notes | Payment |

### Buttons & Actions
| OLD | NEW |
|-----|-----|
| Create GigPack | Pack a new gig |
| Create Your First GigPack | Pack your first gig |
| Add First Section | Add first section |
| Add Song | Add song |
| Add Section (Set 2, Encore, etc.) | Add another section |
| Add Notes | Add notes |
| Hide Notes | Hide notes |
| Copy Link | Copy link |

### Empty States & Toasts
| OLD | NEW |
|-----|-----|
| No gigs packed yet | No gigs packed yet |
| Create your first GigPack for your next show | Pack your first gig to get started |
| ✓ Created | ✓ Packed |
| Gig Pack ready | Your gig is ready to share |
| Changes are live | Changes saved |
| Failed to save | Couldn't save |
| Error | Oops |
| Unable to load Gig Pack | Couldn't load this gig |
| Please try again | Try again in a sec |
| Failed to delete gig pack | Couldn't delete |
| ✓ Deleted | ✓ Gone |
| Gig pack removed | Gig removed |

### Placeholders
- **Gig name:** `Dana's Wedding – Main Stage` (was: `Summer Festival Main Stage`)
- **Venue:** `The Blue Room, Tel Aviv` (was: `The Blue Note`)
- **Address:** `123 Dizengoff St, Tel Aviv` (was: `123 Music St, Jazz City`)
- **Role:** `Vocals, keys, guitar, etc.` (was: `Role (e.g., Vocals)`)
- **Full name:** `Dana Avery` (was: `John Doe`)

### Share Panel
| OLD | NEW |
|-----|-----|
| Share this GigPack | Share with the band |
| Send this to your bandmates so they have all the info | Send this link so everyone has the details |
| Public link | Gig link |
| Prewritten messages | Copy-paste messages |
| Copy these and paste into your band chat or email | Ready-to-send messages for your band chat or email |
| Perfect for rehearsal – let people scan it from your screen | At rehearsal? Let everyone scan this from your screen |
| Band chat / WhatsApp | Band chat / WhatsApp |
| Email / Formal | Email-friendly |

### Public Page (all layouts)
| OLD | NEW |
|-----|-----|
| Who's Playing | Who's playing |
| Setlist | Setlist |
| Logistics | Don't forget |
| Dress Code | Dress code |
| Backline / Gear | Gear |
| Parking / Load-in | Parking |
| Rehearsal Mode | Stage view |
| Stage-optimized view | Big fonts for rehearsal and stage |

### Auth Pages
| OLD | NEW |
|-----|-----|
| Sign In | Sign in |
| Sign Up | Sign up |
| Full Name | Full name |
| Must be at least 6 characters | At least 6 characters |
| Sign in to manage your gig packs | Sign in to manage your gigs |
| Create an account to start sharing gig packs | Create an account to start packing gigs |
| Don't have an account? | Need an account? |
| Error signing in | Couldn't sign in |
| Error signing up | Couldn't create account |
| An unexpected error occurred | Something went wrong |
| You must be logged in | You need to be signed in |
| Let's create your first gig pack | Let's pack your first gig |

---

## 📁 Files Updated

### Translation Files
- **`messages/en.json`** — Primary source of all UI text (80+ strings updated)

### Dashboard & Main Pages
- **`app/gigpacks/client-page.tsx`** — Dashboard header, sheet titles, toast messages
- **`components/gigpack-list.tsx`** — Uses updated translations

### Forms & Editors
- **`components/gigpack-form.tsx`** — Uses updated translations from `en.json`
- **`components/setlist-editor.tsx`** — Empty states, button labels, placeholders

### Share & Public Views
- **`components/gigpack-share-dialog.tsx`** — Uses updated translations
- **`components/gigpack/rehearsal-view.tsx`** — Footer text, icon tooltips
- **`components/gigpack/layouts/minimal-layout.tsx`** — Section header ("Don't forget")
- **`components/gigpack/layouts/social-card-layout.tsx`** — Section headers ("Who's playing", "Don't forget")
- **`components/gigpack/layouts/vintage-poster-layout.tsx`** — Section headers ("Don't forget")

### Auth Pages
- **`app/auth/sign-up/page.tsx`** — Welcome toast, description text

---

## 🎯 Consistency Guidelines for Future Updates

### When adding new UI text:

1. **Keep it casual** — Talk like a bandmate, not a corporate manual
2. **Use "gig" not "GigPack"** in most user-facing contexts
   - ✅ "Pack a new gig"
   - ❌ "Create a new GigPack"
3. **Be action-oriented** — Clear verbs, short phrases
   - ✅ "Save changes"
   - ❌ "Save Changes to GigPack"
4. **Avoid jargon** — Speak musician-to-musician
   - ✅ "Who's playing"
   - ❌ "Lineup configuration"
5. **Short error messages** — Friendly, not blame-y
   - ✅ "Couldn't save"
   - ❌ "An error occurred while attempting to save your changes"

### Where to add new strings:

- **Always use `messages/en.json`** for user-facing text
- Keep strings organized by section: `common`, `dashboard`, `gigpack`, `public`, `share`, etc.
- Use lowercase for most labels (capitalize only for proper nouns or start of sentences)

---

## 🧪 How to Update Microcopy Later

1. **Edit `messages/en.json`** — The single source of truth for all UI text
2. **Use translation keys** — Always use `t("key")` or `tCommon("key")` in components
3. **Follow the tone** — Refer to this document for voice & style
4. **Test edge cases** — Empty states, errors, long text

### Example:
```tsx
// ✅ Good — Uses translation
const t = useTranslations("gigpack");
<h1>{t("title")}</h1>

// ❌ Bad — Hardcoded
<h1>Create New GigPack</h1>
```

---

## 🎨 Before & After Examples

### Dashboard Header
**Before:**
> **GigPack Dashboard**  
> Create shareable gig pages for your bandmates—everything they need in one place.

**After:**
> **Your gigs**  
> Pack all the details your bandmates need—times, setlist, venue, who's playing—into one shareable page.

---

### Empty State
**Before:**
> No gigs packed yet  
> Create your first GigPack for your next show

**After:**
> No gigs packed yet  
> Pack your first gig to get started

---

### Form Section
**Before:**
> **Core Information**  
> Gig Title *  
> Band / Project Name

**After:**
> **Gig basics**  
> Gig name *  
> Band / Project

---

### Share Panel
**Before:**
> **Share this GigPack**  
> Send this to your bandmates so they have all the info.  
> **Public link**

**After:**
> **Share with the band**  
> Send this link so everyone has the details.  
> **Gig link**

---

## ✅ Testing & Validation

All changes preserve existing:
- ✅ Business logic (no routes or API changes)
- ✅ Database schema (no DB changes)
- ✅ Component behavior (only text updates)
- ✅ Authentication flows
- ✅ RLS policies

---

## 🚀 Impact

- **80+ UI strings updated** across the entire app
- **Consistent musician-friendly tone** throughout
- **Easier to scan** — shorter, clearer labels
- **More relatable** — feels like a tool made by/for musicians
- **Maintained clarity** — still professional and easy to understand

---

**Next steps:**  
Keep this tone in mind for future features. When in doubt: "How would you tell your bandmate about this in a group chat?"



