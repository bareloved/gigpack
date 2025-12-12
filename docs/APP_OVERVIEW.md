# GigPack – APP_OVERVIEW

## 1. Tech Stack & Global Architecture
- Next.js 16.0.7 App Router with TypeScript and React server components; routing is primarily locale-scoped under `app/[locale]/*`, with a few public non-locale routes under `app/g/*`.
- Internationalization via `next-intl` (`i18n/routing.ts`, `i18n/request.ts`) with locales `en` and `he`; default locale is `en`. RTL handling for Hebrew is wired through `rtlLocales` in `i18n/config.ts` and `LocaleHtmlAttributes` to set `lang/dir` on `<html>`.
- Styling uses Tailwind CSS (`tailwind.config.ts`) with shadcn/ui components in `components/ui/*`. Dark mode is driven by `next-themes` via `components/theme-provider.tsx`; Tailwind safelists poster skin classes for dynamic theming.
- Supabase provides auth, database, and storage. Server-side client (`lib/supabase/server.ts`) reads/writes cookies for RLS-backed calls; browser client (`lib/supabase/client.ts`) is used in client components. A service-role client (`createServiceClient`) is used only in trusted server contexts (public share API/pages).
- Global layout: `app/layout.tsx` wraps all pages with fonts (`lib/fonts`) and `ThemeProvider`. Locale layout (`app/[locale]/layout.tsx`) adds `NextIntlClientProvider`, `LocaleHtmlAttributes` for RTL/LTR, and the global `Toaster` for notifications.
- Fonts: Heebo and Anton (web + PDF variants). Assets live in `fonts/` and are wired through `lib/fonts.ts`.
- Data utilities: `lib/utils.ts` (slug generation, formatting, URL helpers), `lib/userTemplates.ts` (CRUD for user templates), `lib/gigpackTemplates.ts` (built-in templates), `lib/image-upload.ts` (Supabase storage helpers), and `lib/setlists/types.ts`.

## 2. Routing & Main Screens
- `/` → redirects to `/${defaultLocale}` (`app/page.tsx`).
- `/[locale]` → auth gate: if signed in, redirect to `/[locale]/gigpacks`; otherwise to `/[locale]/auth/sign-in` (`app/[locale]/page.tsx`).
- `/[locale]/auth/sign-in` and `/[locale]/auth/sign-up` (`app/[locale]/auth/*/page.tsx`): client pages for Supabase email/password auth, using `useTranslations("auth")`, `AppLogo`, and toast feedback. On success they route to `/gigpacks` (note: not locale-prefixed in push).
- `/[locale]/gigpacks` (`app/[locale]/gigpacks/page.tsx`): main dashboard for managers. Server component fetches gig packs and optional sheet state, then renders `GigPacksClientPage`. Layout (`app/[locale]/gigpacks/layout.tsx`) enforces auth via Supabase server client and wraps with `AppHeader` plus containerized main area.
- Gig pack create/edit is handled inside the dashboard via the sliding panel `GigEditorPanel` rather than separate routes. `searchParams` `?sheet=create` opens the create panel; `?sheet=edit&gigPackId=...` opens edit with prefetch.
- `/[locale]/setlists` (`app/[locale]/setlists/page.tsx`): self-serve setlist-to-PDF tool (`SetlistsClientPage`). No auth required. Users paste lines, preview, and download via `/api/setlists/pdf`.
- `/[locale]/setlists/print` (`app/[locale]/setlists/print/page.tsx`): server-rendered printable view for setlists, driven by `data` query param (JSON). Supports RTL/LTR and caps to 25 lines.
- Public share:
  - `/g/[slug]` (`app/g/[slug]/page.tsx`) and `/[locale]/g/[slug]` (`app/[locale]/g/[slug]/page.tsx`): fetch gig pack by `public_slug` via service client; render `PublicGigPackView`. Locale variant passes through requested locale; non-locale defaults to English. Both hide `internal_notes` and `owner_id`; 404 handled via `not-found.tsx`.
- Marketing/utility routes (currently lightweight): `/[locale]/design/manager-gigs-preview`, `/[locale]/task-demo`, `/task-demo` are present but minimal.
- App shell: `AppHeader` (logo, language switcher, theme toggle, user menu) is included on authenticated locale pages via layouts. No persistent sidebar; dashboard uses in-page controls for layout switching (board/list/compact).

## 3. Core Domains & Data Models
- Profile (`profiles` table; `supabase/schema.sql`): `id` (user), `full_name`, timestamps. One-to-one with Supabase `auth.users`. RLS restricts to self.
- GigPack (`gig_packs` table; `supabase/schema.sql`, `lib/types.ts`):
  - Key fields: `title` (name), `band_name`, `date`, `call_time`, `on_stage_time`, `venue_name/address/maps_url`, `lineup` (JSON of role/name/notes), `setlist` (legacy text), `setlist_structured` (array of sections/songs), `dress_code`, `backline_notes`, `parking_notes`, `payment_notes`, `internal_notes` (private), `packing_checklist` (array of items), `theme` (`minimal` | `vintage_poster` | `social_card`), branding (`band_logo_url`, `hero_image_url`, `accent_color`, `poster_skin`), `public_slug`, `is_archived`, timestamps, `owner_id` FK to `auth.users`.
  - Relationships: owned by a user; has many user-created templates (see below) and is referenced by public links via `public_slug`. Public views strip `internal_notes` and owner info.
- UserTemplate (`user_templates` table; `supabase/migrations/create_user_templates.sql`, `lib/types.ts`): stores reusable gig defaults. Fields: `name`, `description`, `icon`, `default_values` JSON (captures gig defaults like theme, setlist_structured, packing_checklist), `owner_id`, timestamps. RLS restricts to owner.
- Setlist (client-side data only in `lib/setlists/types.ts` and used for PDF generation): `title`, `location`, `date`, `lines[]`, `options.numbered`, `locale`. No persistence yet; messages hint at future library.
- Profile-to-GigPack: one-to-many via `owner_id`. GigPack-to-Setlist: embedded structured data, not separate table. Templates: derived from GigPack snapshots and stored per user.

## 4. API & Data Flow
- `/api/gigpack/[slug]` (`app/api/gigpack/[slug]/route.ts`): GET public gig pack by `public_slug` using service-role Supabase client. Returns gig pack minus `internal_notes`/`owner_id`; 404s if missing or archived. Called by `PublicGigPackView` poller and initial server fetch for public pages.
- `/api/setlists/pdf` (`app/api/setlists/pdf/route.ts`): POST setlist payload → generates PDF via Playwright by hitting the print page with encoded data. Validates payload, enforces ASCII-safe filenames, responds with PDF attachment. Used by `SetlistsClientPage` download action.
- Supabase clients:
  - Server: `lib/supabase/server.ts` reads/sets cookies for auth context in RSC/route handlers; also exposes `createServiceClient` for service-role operations.
  - Browser: `lib/supabase/client.ts` for auth and CRUD in client components (`GigPacksClientPage`, `GigEditorPanel`, `GigPackForm`, `SetlistsClientPage`, `userTemplates` helpers).
- Data utilities:
  - `lib/userTemplates.ts`: CRUD for user templates; requires authenticated user.
  - `lib/gigpackTemplates.ts`: predefined template presets; merged into editor template menus.
  - `lib/image-upload.ts`: upload/delete assets to Supabase storage (gig pack branding).
  - `lib/utils.ts`: slug generation, date/time formatting, public URL helper.
- Data flow overview:
  - Authenticated dashboard (`/gigpacks`) is server-prefetched (initial gig list + optional gig for editing), then client-side state manages layout, filtering, editing, deleting, and sharing.
  - Editing/creating uses Supabase mutations from the client; on success local state updates and panels close. Deletion uses client Supabase then prunes state.
  - Public pages poll `/api/gigpack/[slug]` every ~5 seconds for near-real-time updates (faster than the README’s older 60s note).
  - Setlist tool is purely client-side until PDF generation, which calls the API route.

## 5. UI System & Components
- UI library: shadcn/ui wrappers live in `components/ui/*` (buttons, cards, dialogs, inputs, tabs, dropdowns, sheet, tooltip, toast, calendar, time-picker, venue autocomplete, etc.).
- Layout & global UI:
  - `app/layout.tsx` sets fonts and theme provider; `app/[locale]/layout.tsx` adds i18n, RTL/LTR attributes, and toaster.
  - `AppHeader` (`components/app-header.tsx`): logo + nav + language switcher + theme toggle + user menu; used across authenticated locale pages via layout.
  - `ThemeToggle` and `ThemeProvider` handle light/dark; `LanguageSwitcher` swaps between `en`/`he` by rewriting the path.
  - `LocaleHtmlAttributes` ensures `lang/dir` are set early for RTL correctness.
- Dashboard & gig editing:
  - `GigPacksClientPage` (`app/[locale]/gigpacks/client-page.tsx`): board/list/compact views, filtering (upcoming/past), “Next up” strip, share/edit/delete actions, opens editor panel.
  - `GigEditorPanel` (`components/gig-editor-panel.tsx`): slide-over with tabs (lineup, setlist v2, logistics, branding), supports templates, uploads, packing checklist, theme/skin/accent color, and public link copy/preview. Uses Supabase client for mutations.
  - `GigPackForm` (`components/gigpack-form.tsx`): earlier form-style editor (still present).
  - `gigpack/layouts/*` (minimal, vintage poster, social card) define public-facing themes; `RehearsalView` offers stage-friendly mode.
  - `public-gigpack-view.tsx`: chooses theme layout, handles rehearsal mode toggle, polls API, shows live status.
- Setlists:
  - `SetlistsClientPage` (`components/setlists/setlists-client-page.tsx`): text-to-PDF workflow with live preview (`SetlistPreview`), numbering toggle, locale-aware alignment.
  - `SetlistAutoPrint` (`components/setlists/setlist-print-auto.tsx`): auto-sizes fonts and supports breaks/notes for printable view.
- Other UI: `AppLogo`, `LanguageSwitcher`, `LocaleHtmlAttributes`, hand-drawn accent components, QR/share dialogs, packing checklist display/editor, template chooser.

## 6. i18n / Localisation
- Implementation: `next-intl` with plugin wrapper in `next.config.mjs` (`withNextIntl` pointing to `i18n/request.ts`). Locales are declared in `i18n/routing.ts` and `i18n/config.ts`.
- Message catalogs live in `messages/en.json` and `messages/he.json`; keys cover auth, dashboard, gigpack editor, setlists, templates, etc.
- Locale routing uses dynamic segment `[locale]`; invalid locales trigger `notFound()` in `app/[locale]/layout.tsx`.
- RTL: `rtlLocales` lists `he`; `LocaleHtmlAttributes` sets `dir="rtl"` and `lang="he"` on load and via inline script. Setlist print and preview adjust alignment and direction based on locale.

## 7. Current Limitations / TODOs
- Setlists are not persisted; the UI and PDF API operate on ad-hoc data. Message copy references a future “Setlist library (coming soon…)”.
- Finance/band/calendar domains are not present; README mentions only gigs. Any finance/bands/calendar links would be future work (?).
- Dashboard creation routes under `/gigpacks/new` and `/gigpacks/[id]/edit` are absent in the current App Router structure; creation/editing happens via the panel instead. Old README paths may be outdated (?).
- Public page polling interval in code is ~5 seconds; README still states 60 seconds (doc drift).
- Some marketing/demo routes (`/design/manager-gigs-preview`, `/task-demo`) are placeholders with minimal logic.
- Supabase schema in `schema.sql` lacks newer columns (branding, packing checklist, structured setlist) added by later migrations; ensure migrations are applied in order to match `lib/types.ts` expectations.

