# GigPack - Share Gig Info with Your Band

A clean, fast, and mobile-friendly web app for creating and sharing gig packs with musicians. Built with Next.js 14, TypeScript, Supabase, and shadcn/ui.

## Features

- 🎵 **Create Gig Packs**: Simple form to capture all gig details
- 🔗 **Share Public Links**: Each gig pack gets a unique, shareable URL
- 📱 **Mobile-Friendly**: Beautiful responsive design for all devices
- 🔄 **Auto-Refresh**: Public pages poll for updates every 60 seconds
- 🔐 **Secure**: Manager-only editing with public read access
- ⚡ **Fast & Clean**: Minimal dependencies, optimized performance

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database & Auth**: Supabase
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS

## Getting Started

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great)

### 2. Set Up Supabase

1. Create a new project at [https://app.supabase.com](https://app.supabase.com)

2. In your Supabase dashboard, go to **SQL Editor** and run the schema:
   - Copy the entire contents of `supabase/schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to create all tables, policies, and functions

3. Get your Supabase credentials:
   - Go to **Settings** → **API**
   - Copy your **Project URL**
   - Copy your **Publishable key** (this is the anon/public key, starts with `sb_publishable_...`)
   - Copy your **Secret key** (labeled "default", starts with `sb_secret_...` - this is the service role key, keep it secret!)

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

⚠️ **Important**: 
- Replace the placeholder values with your actual Supabase credentials
- Never commit `.env.local` to git (it's already in `.gitignore`)
- The service role key should NEVER be exposed to the browser

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

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

