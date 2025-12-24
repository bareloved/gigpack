# Export Spec for migrating Gigmaster → Ensemble

## 1. What data exists and where

### Database Tables (Supabase)

| Table | Purpose | Key Fields | JSONB Fields | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `gig_packs` | Core entity. Stores all gig details. | `id`, `owner_id`, `public_slug`, `title`, `date`, `band_id` | `lineup`, `setlist_structured`, `packing_checklist`, `materials`, `schedule` | Central table. `public_slug` is unique index for sharing. |
| `bands` | Reusable band profiles. | `id`, `owner_id`, `name`, `band_logo_url` | `default_lineup` | Newly added. Defines branding/skins and default members. |
| `user_templates` | User-created gig presets. | `id`, `owner_id`, `name` | `default_values` | Stores partial `GigPack` shape in `default_values`. |
| `profiles` | User profile data. | `id` (FK to auth), `full_name` | - | 1:1 with `auth.users`. |

### JSONB Structures & "Meaning"

**1. `gig_packs.lineup` & `bands.default_lineup`**
Array of objects representing people on stage.
```json
[
  {
    "role": "Vocals",    // Free text role
    "name": "Alice",     // Optional name
    "notes": "Lead mic"  // Optional tech/logistics notes
  }
]
```

**2. `gig_packs.setlist_structured` (Setlist v2)**
Structured song data organized by sections.
```json
[
  {
    "id": "uuid",
    "name": "Set 1",
    "songs": [
      {
        "id": "uuid",
        "title": "Song Name",
        "artist": "Artist",
        "key": "Cm",
        "tempo": "120",
        "notes": "Transition fast"
      }
    ]
  }
]
```
*Note: `gig_packs.setlist` (text) is a legacy field for raw text setlists.*

**3. `gig_packs.packing_checklist`**
Items the user needs to bring.
```json
[
  { "id": "uuid", "label": "Guitar" },
  { "id": "uuid", "label": "Pedalboard" }
]
```
*Note: Checkbox state (checked/unchecked) is currently local-only in `localStorage` and NOT in DB.*

**4. `gig_packs.materials`**
Links to external resources.
```json
[
  {
    "id": "uuid",
    "label": "Demo MP3",
    "url": "https://...",
    "kind": "rehearsal" // enum: rehearsal, performance, charts, reference, other
  }
]
```

**5. `gig_packs.schedule`**
Day-of timeline.
```json
[
  { "id": "uuid", "time": "18:00", "label": "Load In" }
]
```

## 2. What routes/features must be preserved

### Public Share Page
- **Route**: `/g/[slug]` (via `app/[locale]/g/[slug]/page.tsx`)
- **Mechanism**:
  - Client component polls `/api/gigpack/[slug]`.
  - API uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS (public read-only).
  - Returns sanitized object (strips `internal_notes`, `owner_id`).
  - **Critical**: Must preserve `public_slug` stability so existing links work.

### PDF Setlist Generation
- **API Route**: `/api/setlists/pdf` (POST)
- **Print View**: `/setlists/print` (via `app/[locale]/setlists/print/page.tsx`)
- **Mechanism**:
  - User POSTs JSON payload to API.
  - API launches Playwright (chromium).
  - Playwright visits `[APP_ORIGIN]/[locale]/setlists/print?data=[ENCODED_JSON]`.
  - Page renders clean HTML/CSS (A4 optimized).
  - Playwright prints to PDF buffer and returns it.
- **Dependency**: Requires running app instance reachable by the server (loopback).

## 3. Canonical "meaning" of fields

- **`theme`**: Controls layout density (`minimal`, `vintage_poster`, `social_card`).
- **`poster_skin`**: Controls visual texture/font mood (`clean`, `paper`, `grain`).
- **`gig_type`**: Classification for analytics/defaults (`wedding`, `club_show`, etc.).
- **`is_archived`**: Soft delete. Archived packs are hidden from dashboard and public API returns 404.

## 4. Suggested migration mapping

### Destination: Ensemble (Hypothetical)

| GigPack Source | Ensemble Concept | Transformation Rule |
| :--- | :--- | :--- |
| `gig_packs` row | `Event` / `Gig` | Direct mapping. |
| `lineup` (JSONB) | `EventTeam` (Table) | Explode JSON array into relational rows linked to Event. |
| `setlist_structured` | `Setlist` (Table) + `SetlistItems` | Explode sections/songs. Warning: Songs might need to map to a central `SongLibrary`. |
| `bands` row | `Group` / `Artist` | Direct mapping. |
| `packing_checklist` | `PersonalTasks` | Map to user-specific task lists linked to the event. |

**Edge Cases**:
- **Unstructured Setlists**: Legacy `setlist` (text) field might need a "Notes" or "Legacy Setlist" field in Ensemble if it doesn't support raw text.
- **Local Checkbox State**: Current app stores checklist completion in `localStorage`. This data will be LOST on migration unless we build a client-side scraper (unlikely).
- **Slug Collisions**: If Ensemble has global slugs, ensure `gig_packs.public_slug` doesn't collide with existing Ensemble events.

## 5. Required env vars / integrations

- **Supabase**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (CRITICAL for public share API)
- **Host Resolution**:
  - `NEXT_PUBLIC_APP_URL` or `APP_ORIGIN`: Used by PDF generator to find the print page.
- **Google Maps**:
  - `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`: Used in `VenueAutocomplete`.

## 6. Risks / gotchas

1.  **RLS & Service Role**: The public share feature depends entirely on the `GET /api/gigpack/[slug]` endpoint having `SUPABASE_SERVICE_ROLE_KEY`. If migrated to a system without service role access (e.g., client-only Firebase), public sharing will break or require a new strategy (e.g., explicit "public" flag on docs).
2.  **PDF Rendering**: The PDF generator is heavy (Playwright). If moving to a serverless environment with size limits (e.g., AWS Lambda standard limits), Playwright binaries might fail.
3.  **Locale Routing**: GigPack heavily uses `next-intl` (`/[locale]/...`). If Ensemble uses a different i18n strategy (e.g., subdomain or cookie-only), all internal links and redirects in `middleware.ts` will need rewriting.
4.  **Date/Time Handling**: `date` is `DATE` type (YYYY-MM-DD), but `call_time` is free text (`TEXT`). If Ensemble expects strict `TIMESTAMP`, parsing "7pm ish" or "19:00" will be required.

