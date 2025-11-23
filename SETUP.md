# GigPack Setup Guide

This guide will walk you through setting up GigPack from scratch.

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - Name: `gigpack` (or any name you like)
   - Database Password: (choose a strong password)
   - Region: (select closest to you)
4. Wait for the project to be created (1-2 minutes)

### 3. Run Database Schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click "New Query"
3. Open the file `supabase/schema.sql` from this project
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned"

### 4. Get Your Supabase Keys

1. In Supabase dashboard, go to **Settings** (gear icon in sidebar)
2. Click **API** in the settings menu
3. You'll see your keys in two sections:

   **Project URL** (at the top)
   - Looks like `https://xxxxxxxxxxxxx.supabase.co`
   
   **Publishable key** (safe for browser)
   - This is your anon/public key
   - Starts with `sb_publishable_...`
   
   **Secret keys** (server-only)
   - Look for the "default" secret key
   - Starts with `sb_secret_...`
   - Click the eye icon 👁️ to reveal it
   - This is your service role key

### 5. Create Environment File

1. In the project root, create a file named `.env.local`
2. Add these three lines (replace with your actual values):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxx
```

⚠️ **Security Note**: 
- The `NEXT_PUBLIC_` prefix means it's safe for the browser
- The `SUPABASE_SERVICE_ROLE_KEY` is server-only and should NEVER be exposed to the browser
- Never commit `.env.local` to git

### 6. Disable Email Confirmation (for development)

For easier testing during development:

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Click **Email** provider
3. Scroll down to "Email Confirmation"
4. **Disable** "Confirm email"
5. Click **Save**

⚠️ **Note**: Re-enable this for production!

### 7. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing Your Setup

### Test 1: Sign Up & Sign In

1. Go to `http://localhost:3000`
2. Click "Sign up"
3. Fill in:
   - Full Name: Test User
   - Email: test@example.com
   - Password: password123
4. Click "Sign Up"
5. You should be redirected to `/gigpacks` dashboard

### Test 2: Create a Gig Pack

1. Click "Create Gig Pack"
2. Fill in the form:
   - Title: "Test Gig at Blue Note"
   - Band: "Jazz Quartet"
   - Date: (select today's date)
   - Call Time: 18:00
   - On Stage Time: 19:30
   - Venue Name: "The Blue Note"
   - Venue Address: "123 Jazz St"
3. Add a lineup member:
   - Role: "Vocals"
   - Name: "Jane Doe"
4. Add setlist:
   ```
   Take Five - Dave Brubeck - Dm
   Blue in Green - Miles Davis - Dm
   ```
5. Click "Create Gig Pack"
6. You should see your new gig pack in the dashboard

### Test 3: Public Link

1. In the dashboard, click "Copy Link" on your gig pack
2. Open a new incognito/private browser window
3. Paste the link and visit it
4. You should see a beautiful public page with all the gig details
5. No login required!

### Test 4: Auto-Refresh

1. Keep the public page open
2. In your normal browser (logged in), click "Edit" on the gig pack
3. Change the call time to "17:30"
4. Click "Save Changes"
5. Wait 60 seconds
6. The public page should automatically update with the new time!

## Verification Checklist

- [ ] Dependencies installed successfully
- [ ] Supabase project created
- [ ] Database schema executed without errors
- [ ] `.env.local` file created with correct keys
- [ ] Dev server starts without errors
- [ ] Can sign up and log in
- [ ] Can create a gig pack
- [ ] Can view dashboard with gig pack
- [ ] Public link works in incognito mode
- [ ] Editing updates the public page (after 60 seconds)

## Common Issues

### Issue: "Invalid API key"
**Solution**: Double-check your keys in `.env.local`. Make sure there are no extra spaces or quotes.

### Issue: "Error executing SQL"
**Solution**: 
1. Make sure you're running the schema in the correct project
2. Try running each section of the schema separately
3. Check for any error messages in the SQL output

### Issue: "Cannot read properties of undefined"
**Solution**: 
1. Restart the dev server after changing `.env.local`
2. Make sure all three environment variables are set
3. Check the browser console for detailed errors

### Issue: Public page shows 404
**Solution**:
1. Verify the service role key is set in `.env.local`
2. Check that the gig pack was created successfully
3. Try creating a new gig pack

### Issue: Sign up doesn't work
**Solution**:
1. Check you disabled email confirmation in Supabase
2. Look at the browser console for error messages
3. Verify your Supabase anon key is correct

## Next Steps

Once everything is working:

1. **Customize the styling**: Edit `app/globals.css` to change colors
2. **Add more fields**: Modify the form and database schema
3. **Change polling interval**: Edit `components/public-gigpack-view.tsx`
4. **Deploy to Vercel**: 
   ```bash
   vercel
   ```
   (Don't forget to set environment variables in Vercel!)

## Getting Help

- Check the README.md for detailed documentation
- Review the inline code comments
- Check Supabase logs in the dashboard
- Look at the browser console for client-side errors
- Check the terminal for server-side errors

## Database Schema Overview

The schema creates:

1. **profiles** table - stores user information
2. **gig_packs** table - stores all gig pack data
3. **RLS policies** - ensures owners can only see/edit their own packs
4. **Triggers** - auto-updates timestamps
5. **Functions** - creates profile on user signup

All of this is set up automatically when you run the schema SQL!

---

You're all set! 🎉 Start creating and sharing gig packs!

