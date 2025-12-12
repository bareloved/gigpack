# GigMaster - Gig Management for Working Musicians

GigMaster is a comprehensive gig management and planning tool designed specifically for working musicians and bands. Create detailed gig packs, share information seamlessly with your bandmates, generate professional setlists and PDFs, and manage your entire gig workflow—all in one beautifully designed app.

## What is GigMaster?

GigMaster helps musicians create, share, and manage gig information through:
- **Gig Packs**: Comprehensive gig planning with all details in one shareable page
- **Structured Setlists**: Professional setlist management with keys, tempos, and notes
- **PDF Generation**: Print-ready setlists and gig documentation
- **Band Collaboration**: Share links, QR codes, and pre-written messages
- **Multi-language Support**: Full Hebrew and English localization with RTL support
- **Professional Templates**: Pre-configured templates for weddings, clubs, corporate events, and more

## Key Features

- 🎵 **Gig Pack Creation**: Detailed forms with logistics, lineup, setlists, and branding
- 🔗 **Public Sharing**: Unique URLs and QR codes for easy band communication
- 📄 **PDF Setlists**: Generate printable setlists with professional formatting
- 🎨 **Custom Branding**: Band logos, hero images, accent colors, and poster skins
- 📱 **Mobile-Optimized**: Perfect for stage use with rehearsal mode
- 🌙 **Dark Mode**: Stage-friendly low-light viewing
- 🏗️ **Structured Setlists**: Section-based setlists with metadata (keys, tempos, notes)
- 📋 **Templates**: Quick-start templates for common gig types
- 🌐 **International**: Hebrew (RTL) and English support
- 🔄 **Real-time Updates**: Public pages auto-refresh when gigs are edited

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database & Auth**: Supabase with RLS
- **UI Components**: shadcn/ui with Tailwind CSS
- **Internationalization**: next-intl with URL-based routing
- **PDF Generation**: Playwright for print-quality PDFs
- **Styling**: Tailwind CSS with custom design system

## Quick Start

1. **Set up Supabase**: Create a project and run the database schema
2. **Configure environment**: Add your Supabase credentials to `.env.local`
3. **Install & run**: `npm install && npm run dev`

See [Setup Guide](docs/setup/SETUP.md) for detailed instructions.

## Project Documentation

### 📚 Documentation Overview
- **[App Overview](docs/overview/APP_OVERVIEW.md)** - Complete technical architecture and current state
- **[Setup Guide](docs/setup/SETUP.md)** - Step-by-step installation and configuration

### 🎯 Feature Documentation
- **[Gig Pack Templates](docs/features/templates/GIGPACK-TEMPLATES-IMPLEMENTATION.md)** - Pre-configured gig templates
- **[Structured Setlists](docs/features/setlists/SETLIST-V2-IMPLEMENTATION.md)** - Professional setlist management
- **[Rehearsal Mode](docs/features/rehearsal/REHEARSAL-MODE-IMPLEMENTATION.md)** - Stage-optimized viewing
- **[Share Panel](docs/features/sharing/SHARE-PANEL-IMPLEMENTATION.md)** - Band communication tools
- **[Branding & Poster Skins](docs/features/branding/BRANDING-IMPLEMENTATION-SUMMARY.md)** - Custom band branding

### 🎨 Design System
- **[Design System](docs/design/DESIGN-SYSTEM.md)** - Complete design language and patterns
- **[Hand-Drawn Accents](docs/design/HAND-DRAWN-ACCENTS.md)** - Custom illustration system
- **[Microcopy Refresh](docs/design/MICROCOPY-REFRESH-SUMMARY.md)** - Language and tone guidelines
- **[Design Changes](docs/design/DESIGN-CHANGES-SUMMARY.md)** - Visual overhaul summary

### 🌐 Internationalization
- **[i18n Overview](docs/i18n/I18N.md)** - Complete internationalization system
- **[Hebrew Implementation](docs/i18n/HEBREW_LOCALE_IMPLEMENTATION.md)** - Hebrew locale details
- **[Hebrew Audit](docs/i18n/HEBREW_LOCALE_AUDIT.md)** - Translation audit report

### 🛠️ Operations & Development
- **[Pre-Flight Checklist](docs/ops/PRE-FLIGHT-CHECKLIST.md)** - Development setup verification
- **[Documentation Maintenance](docs/ops/DOCUMENTATION-MAINTENANCE.md)** - Documentation organization rules
- **[Debug Guide](docs/debug/DEBUG-POSTER-SKIN.md)** - Troubleshooting poster skins
- **[Changelog](docs/changelog/CHANGELOG.md)** - Version history and updates

## Architecture Highlights

### Key Features Explained

#### Auto-Refresh with Polling
Public gig pack pages use smart polling:
- Polls every ~5 seconds for near-real-time updates
- Shows "Active" status when polling successfully
- Graceful fallback if network issues occur
- No WebSockets needed—simple and reliable

#### Security Model
- **Row Level Security (RLS)**: Users can only access their own gigs
- **Service Role API**: Trusted server-side operations for public access
- **Private Notes**: Internal notes never exposed to public API
- **Auth Middleware**: Automatic redirects for protected routes

#### Internationalization
- **URL-based routing**: `/en/gigpacks` and `/he/gigpacks`
- **Full RTL support**: Hebrew locale with proper text direction
- **Locale-aware formatting**: Dates, times, and numbers
- **Google Sans font**: Professional typography for Hebrew UI

### Project Structure

```
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Internationalized routes
│   │   ├── gigpacks/            # Manager dashboard
│   │   ├── g/[slug]/            # Public gig pack pages
│   │   ├── setlists/            # PDF setlist tool
│   │   └── auth/                # Authentication
│   ├── api/                     # API routes
│   └── globals.css              # Global styles + design system
├── components/                  # React components
│   ├── ui/                      # shadcn/ui components
│   ├── gigpack/                 # Gig pack features
│   ├── setlists/                # Setlist tools
│   └── hand-drawn/              # Custom illustrations
├── lib/                         # Business logic
│   ├── supabase/                # Database helpers
│   ├── gigpackTemplates.ts      # Pre-built templates
│   └── utils.ts                 # Utilities
├── docs/                        # Documentation
│   ├── overview/                # App architecture
│   ├── setup/                   # Getting started
│   ├── features/                # Feature details
│   ├── design/                  # Design system
│   ├── i18n/                    # Internationalization
│   ├── ops/                     # Operations
│   ├── debug/                   # Troubleshooting
│   └── changelog/               # Release history
└── messages/                    # Translation files
    ├── en.json                  # English translations
    └── he.json                  # Hebrew translations
```

## Development

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works great)

### Quick Setup
1. **Clone and install**: `npm install`
2. **Set up Supabase**: Create project and run schema from `supabase/schema.sql`
3. **Configure environment**: Add credentials to `.env.local`
4. **Run development**: `npm run dev`

See [Setup Guide](docs/setup/SETUP.md) and [Pre-flight Checklist](docs/ops/PRE-FLIGHT-CHECKLIST.md) for detailed instructions.

### Building for Production
```bash
npm run build
npm start
```

## Deployment

This app deploys to any platform supporting Next.js 16+:
- **Vercel** (recommended - zero config needed)
- **Netlify**
- **Railway**
- **Self-hosted**

Remember to set your environment variables in your deployment platform!

## Customization

### Changing Polling Interval
In `components/public-gigpack-view.tsx`, modify the interval (currently ~5 seconds).

### Styling & Theming
- All colors defined in `app/globals.css` using CSS variables
- Customize the theme by modifying CSS variables
- Components use Tailwind CSS utility classes
- See [Design System](docs/design/DESIGN-SYSTEM.md) for complete customization guide

## Troubleshooting

### Common Issues
- **"Error fetching gig packs"**: Check Supabase credentials in `.env.local`
- **Public pages return 404**: Verify service role key and gig pack exists
- **Auth not working**: Confirm email confirmation settings in Supabase
- **Font issues**: Check Google Fonts CDN loading

For detailed troubleshooting, see [Debug Guide](docs/debug/DEBUG-POSTER-SKIN.md).

## Contributing

See [App Overview](docs/overview/APP_OVERVIEW.md) for technical architecture and development guidelines.

## License

MIT

## Support

For issues or questions:
1. Check the [documentation](docs/) first
2. Review code comments and inline documentation
3. Check the Supabase schema for data model details

---

Built with ❤️ for musicians everywhere.

## Testing the Full Flow

### Step 1: Sign Up
1. Navigate to `http://localhost:3000`
2. You'll be redirected to the sign-in page
3. Click "Sign up" and create an account
4. After signing up, you'll be redirected to your dashboard

### Step 2: Create a Gig Pack
1. Click "Create Gig Pack" button
2. Fill in the gig details:
   - **Core Info**: Title, band name, date, times, venue
   - **Lineup**: Add musicians and their roles
   - **Setlist**: List your songs (one per line)
   - **Logistics**: Dress code, gear, parking, payment notes
   - **Internal Notes**: Private notes (not visible on public page)
3. Click "Create Gig Pack"
4. You'll be redirected to your dashboard

### Step 3: Share the Gig Pack
1. Find your gig pack in the dashboard
2. Click "Copy Link" to copy the public URL
3. Open the link in an incognito/private window (to test public view)
4. You should see a beautiful, mobile-friendly gig pack page

### Step 4: Test Auto-Refresh
1. Keep the public gig pack page open
2. Go back to your dashboard and click "Edit" on the gig pack
3. Make a change (e.g., update the call time)
4. Click "Save Changes"
5. Wait up to 60 seconds
6. The public page will automatically refresh with the new data!

## Project Structure

```
/Users/bareloved/Cursor Projects/Gigmaster/
├── app/
│   ├── api/                    # API routes
│   │   └── gigpack/[slug]/    # Public gig pack fetch endpoint
│   ├── auth/                   # Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── gigpacks/               # Manager dashboard
│   │   ├── [id]/edit/         # Edit gig pack
│   │   ├── new/               # Create gig pack
│   │   └── page.tsx           # List gig packs
│   ├── g/[slug]/              # Public gig pack pages
│   └── layout.tsx             # Root layout
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── gigpack-form.tsx       # Gig pack create/edit form
│   ├── gigpack-list.tsx       # Dashboard list view
│   ├── public-gigpack-view.tsx # Public view with polling
│   └── user-menu.tsx          # User dropdown menu
├── lib/
│   ├── supabase/              # Supabase client helpers
│   ├── types.ts               # TypeScript types
│   └── utils.ts               # Utility functions
├── supabase/
│   └── schema.sql             # Database schema
└── middleware.ts              # Auth middleware
```

## Key Features Explained

### Auto-Refresh with Polling

The public gig pack pages use a simple polling mechanism:
- Every 60 seconds, the page fetches the latest data from the API
- If the data has changed, the UI updates automatically
- No WebSockets or complex real-time infrastructure needed
- Simple, reliable, and perfect for this use case

### Security Model

- **RLS Policies**: Each gig pack can only be edited by its owner
- **Public Access**: Public pages use a server-side API route with service role key
- **No Leaked Data**: Internal notes are never sent to the public API
- **Auth Middleware**: Protected routes redirect to sign-in if not authenticated

### Slug Generation

- Each gig pack gets a unique, URL-friendly slug
- Generated from the title + random suffix
- Example: `summer-festival-main-stage-3k9x2a`
- Prevents collisions and makes links shareable

## Building for Production

```bash
npm run build
npm start
```

## Deployment

This app is ready to deploy to:
- **Vercel** (recommended - zero config needed)
- **Netlify**
- Any platform supporting Next.js 14+

Remember to set your environment variables in your deployment platform!

## Customization

### Changing Polling Interval

In `components/public-gigpack-view.tsx`, find this line:

```typescript
}, 60000); // Poll every 60 seconds
```

Change `60000` to your desired interval in milliseconds (e.g., `30000` for 30 seconds).

### Styling

- All colors are defined in `app/globals.css` using CSS variables
- Customize the theme by modifying the CSS variables
- Components use Tailwind CSS utility classes

## Troubleshooting

### "Error fetching gig packs"
- Check that your Supabase URL and anon key are correct in `.env.local`
- Make sure you ran the schema SQL in Supabase
- Check the browser console for detailed error messages

### Public pages return 404
- Verify the service role key is set in `.env.local`
- Check that the gig pack exists and `is_archived = false`
- Look at the API route logs in your terminal

### Auth not working
- Confirm email confirmation is disabled in Supabase (for development)
- Go to **Authentication** → **Email Auth** → Disable "Confirm email"
- Or check your email for the confirmation link

## License

MIT

## Support

For issues or questions, please check the code comments or review the Supabase schema file for detailed documentation.

---

Built with ❤️ for musicians everywhere.

