## Setlists PDF – How it works (concise)

- Trigger: client calls `POST /api/setlists/pdf` with `SetlistData` (title/location/date/lines/options/locale).
- API flow:
  - Validates payload, resolves `locale` (defaults to routing.defaultLocale).
  - Builds URL: `/${locale}/setlists/print?data=<json>` (data is JSON-stringified, not double-encoded).
  - Playwright opens that URL and runs `page.pdf()`:
    - format: A4; scale: 0.9; printBackground: true; margins: 0.5cm all sides; pageRanges: "1".
  - Streams resulting PDF back with `Content-Disposition` attachment.
- HTML rendered for PDF:
  - Route: `/app/[locale]/setlists/print/page.tsx`.
  - Renders `SetlistAutoPrint` with direction/align derived from locale (`he` -> rtl/right, others -> ltr/left).
  - Layout is pure HTML/CSS; page content defines what Playwright prints.
- Main React pieces:
  - Client page: `components/setlists/setlists-client-page.tsx` (builds payload, preview, download button).
  - Preview (on-page + iframe print preview): `components/setlists/setlist-preview.tsx`.
  - Print page HTML: `/app/[locale]/setlists/print/page.tsx` → `components/setlists/setlist-print-auto.tsx` (the HTML Playwright captures).
- Safe to change:
  - HTML/CSS in the print page and `SetlistAutoPrint` for layout/RTL alignment tweaks.
  - Preview components/Styling for on-page view.
- Be cautious / do not touch without strong reason:
  - API request/response shape (`SetlistData`), URL encoding, and locale resolution in `/api/setlists/pdf`.
  - Playwright `page.pdf` options (format, scale, margins, printBackground).
  - Overall payload parsing and validation.

