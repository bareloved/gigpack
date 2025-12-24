# App Overview (Gigmaster)

## 1. What this app is
- **Gigmaster** is a gig management and planning tool for working musicians and bands.
- **Primary Users**: Band leaders, musical directors, and working musicians.
- **Primary Workflows**:
  - **Create Gig Packs**: Managers create detailed event pages (logistics, lineup, setlists).
  - **Share**: Public, mobile-friendly links (and QR codes) are shared with band members.
  - **Setlists**: structured setlists with keys/tempos are managed and exported to PDF.
  - **Collaboration**: Band members view details without needing an account (public read-only view).

## 2. Tech stack
- **Framework/Runtime**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS, shadcn/ui, Lucide React
- **State/Data Fetching**: Server Components + Supabase Client (hooks)
- **Auth**: Supabase Auth (Email/Password) with custom UI
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage (buckets: `gigpack-assets`)
- **PDF/Exports**: Playwright (server-side generation via API route)
- **I18n**: `next-intl` (English `en` and Hebrew `he` with RTL support)
- **Maps**: Google Maps JavaScript API (Venue Autocomplete)

## 3. Repo structure
- **Root**: `app`, `components`, `lib`, `supabase`, `messages` (i18n), `docs`
- **Key Entrypoints**:
  - `app/[locale]/page.tsx`: Landing page
  - `app/[locale]/gigpacks/page.tsx`: Manager dashboard (protected)
  - `app/[locale]/g/[slug]/page.tsx`: Public gig pack view (unprotected)
  - `app/api/gigpack/[slug]/route.ts`: Public API for fetching gig data
  - `app/api/setlists/pdf/route.ts`: PDF generation endpoint

## 4. Deployment & environments
- **Where it runs**: Vercel (recommended) or any Next.js compatible host.
- **Build Command**: `npm run build` (standard Next.js build)
- **Start Command**: `npm start`
- **Environments**:
  - Assumes standard Dev/Prod split via `.env` files.
  - Requires Supabase project (DB + Auth + Storage).

## 5. Auth & user model
- **Provider**: Supabase Auth (Email/Password).
- **Flow**: Custom Sign-In/Sign-Up pages at `app/[locale]/auth/`.
- **Session Handling**: Handled via Supabase SSR helpers (`@supabase/ssr`) and middleware (see Known Issues).
- **User Model**:
  - `auth.users`: Managed by Supabase.
  - `public.profiles`: Extends user data (`id` FK to `auth.users`, `full_name`).
  - Trigger `handle_new_user` automatically creates a profile on signup.

## 6. Database
### 6.1 Provider + Access Layer
- **Provider**: Supabase (PostgreSQL).
- **Access**:
  - **Server Components**: Direct DB access via `@supabase/ssr`.
  - **Client Components**: Supabase client for some interactions (though mostly Server Actions/APIs).
  - **Public API**: Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for public slugs.

### 6.2 Schema Summary (Key Tables)

| Table Name | Purpose | Primary Key | Notable Columns | Relations |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | User profile data | `id` (UUID) | `full_name` | `id` -> `auth.users.id` |
| `gig_packs` | Core gig entity | `id` (UUID) | `title`, `date`, `public_slug` (Unique), `lineup` (JSONB), `setlist_structured` (JSONB), `is_archived` | `owner_id` -> `auth.users.id` |
| `bands` | Band identity/branding | `id` (UUID) | `name`, `band_logo_url`, `poster_skin`, `default_lineup` (JSONB) | `owner_id` -> `auth.users.id` |

### 6.3 RLS / Policies
- **Row Level Security (RLS)** is ENABLED on all tables.
- **Policies**:
  - Users can only view/edit their own data (`auth.uid() = owner_id`).
  - Public access to `gig_packs` is NOT handled via RLS policies but via a dedicated API route (`api/gigpack/[slug]`) using the Service Role key.

### 6.4 Migrations
- Located in `supabase/migrations/`.
- Includes schema setup, RLS policies, and seed data (`seed-mock-gigs.ts`).

## 7. Core domain modules

### **Gig Packs**
- **Purpose**: The central event object containing all logistics and musical details.
- **Routes**:
  - `/[locale]/gigpacks`: List view.
  - `/[locale]/gigpacks/[id]/edit`: Editor.
  - `/[locale]/g/[slug]`: Public read-only view.
- **Files**: `app/[locale]/gigpacks/`, `components/gigpack-form.tsx`.

### **Bands**
- **Purpose**: Reusable profiles for different musical groups (branding, default members).
- **Routes**: `/[locale]/bands`.
- **Files**: `app/[locale]/bands/`, `components/band-editor-panel.tsx`.

### **Setlists**
- **Purpose**: Managing songs, keys, and tempos.
- **Implementation**: Stored as JSONB (`setlist_structured`) within `gig_packs`.
- **Files**: `components/structured-setlist.tsx`, `app/setlists/print/`.

## 8. Routes and APIs

### 8.1 Pages / App Routes
- `/[locale]/auth/*`: Authentication pages.
- `/[locale]/gigpacks/*`: Protected management pages.
- `/[locale]/bands/*`: Band management.
- `/[locale]/g/[slug]`: Public gig pack page (Next.js Page).
- `/[locale]/setlists/print`: Print-optimized view for PDF generation.

### 8.2 API Routes
- `GET /api/gigpack/[slug]`:
  - Fetches gig data by public slug.
  - Bypasses RLS using Service Role Key.
  - Filters out sensitive fields (internal notes).
- `POST /api/setlists/pdf`:
  - Generates a PDF of a setlist.
  - Uses Playwright to render `/[locale]/setlists/print`.

### 8.3 External APIs
- **Google Maps Places API**: Used in `VenueAutocomplete` component for address search.

### 8.4 Webhooks
- None explicitly visible in the codebase, but Supabase Auth webhooks might be configured in the Supabase dashboard (not visible in code).

## 9. Files, media, and exports
- **Storage**: Supabase Storage bucket `gigpack-assets` (referenced in migrations).
- **Images**: Used for band logos and hero images.
- **PDFs**: Generated via Headless Chromium (Playwright) calling back to the app's own print route.
  - **Logic**: `app/api/setlists/pdf/route.ts` launches browser -> visits internal URL -> `page.pdf()`.

## 10. Configuration (Env Vars)

| Variable | Purpose | Used In |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Connection string for Supabase | Client & Server clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public API key | Client & Server clients |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin API key (Bypass RLS) | `api/gigpack/[slug]`, `seed-mock-gigs.ts` |
| `NEXT_PUBLIC_APP_URL` / `APP_ORIGIN` | Base URL for PDF generator callbacks | `lib/utils.ts`, PDF API |
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`| Google Maps Places Autocomplete | `VenueAutocomplete` component |

## 11. Observability, testing, performance
- **Logging**: Standard `console.log` / `console.error`. No dedicated logger (e.g. Pino/Winston).
- **Tests**: None visible in `package.json` (no `jest`, `vitest` scripts). Playwright is present but used for PDF generation, not E2E testing.
- **Performance**:
  - `next-intl` for static generation of locale params.
  - Public gig pages use polling (client-side) for updates (referenced in `README.md`).

## 12. Security review
- **RLS**: Correctly implemented for private data.
- **Public Access**: Securely handled via specific API endpoint that explicitly excludes sensitive fields (`internal_notes`).
- **Validation**: `zod` and `react-hook-form` used for input validation.
- **Data Protection**: Supabase handles encryption at rest.

## 13. Known issues / tech debt
- **Middleware Misconfiguration**: The file `proxy.ts` appears to contain the Next.js Middleware logic (auth protection + i18n), but it is **not named** `middleware.ts`. Unless there is a hidden build config, **middleware is likely not running**, meaning:
  - Protected routes might be accessible without login.
  - Locale redirection might fail.
- **No Tests**: Lack of unit/integration tests makes merging risky.
- **Hardcoded Polling**: Public pages poll every X seconds (mentioned in docs), which can scale poorly.

## 14. Merge readiness notes
- **Easiest to Extract**:
  - **UI Components**: `shadcn/ui` components are standard and portable.
  - **Setlist Logic**: The structured setlist parsing and PDF generation is a self-contained module.
- **Coupling Points**:
  - **Supabase Auth**: Deeply integrated into RLS policies. Hard to swap for another auth provider without rewriting DB security.
  - **I18n**: `next-intl` usage dictates the `/[locale]/` routing structure. Merging into a non-i18n app or one using a different library would be complex.
- **Suggested Boundaries**:
  - Keep the `gigpack` and `setlist` features as distinct modules.
  - The "Band" concept is generic and might conflict with "Organizations" or "Teams" in a target app.

## 15. Open questions / unknowns
- **Is Middleware working?**: Why is it named `proxy.ts`? Verify if `middleware.ts` exists or if this is a mistake.
- **Webhooks**: Are there any Supabase triggers calling external services not in the repo?
- **Email Config**: How are transactional emails (invites, etc.) handled? (Supabase default or external service?)

