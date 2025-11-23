-- Insert Mock GigPacks for Testing
-- This script creates sample gigs with full information to test the theme system
-- Run this AFTER running add_theme_column.sql migration

-- Get the first user ID (or replace with your specific user ID)
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Try to get the first user from auth.users
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  -- If no users exist, you'll need to create one first or replace this with your user ID
  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please sign up first or replace test_user_id with your user UUID';
  END IF;

  -- Mock Gig 1: Minimal Theme - Jazz Club Gig
  INSERT INTO public.gig_packs (
    owner_id,
    title,
    band_name,
    date,
    call_time,
    on_stage_time,
    venue_name,
    venue_address,
    venue_maps_url,
    lineup,
    setlist,
    dress_code,
    backline_notes,
    parking_notes,
    payment_notes,
    internal_notes,
    public_slug,
    theme,
    is_archived
  ) VALUES (
    test_user_id,
    'Friday Night Jazz Session',
    'The Blue Note Quartet',
    CURRENT_DATE + INTERVAL '7 days',
    '19:00',
    '20:30',
    'The Blue Note Jazz Club',
    '131 W 3rd St, New York, NY 10012',
    'https://maps.google.com/?q=The+Blue+Note+Jazz+Club+New+York',
    '[
      {"role": "Piano", "name": "Sarah Chen", "notes": "Bring own keyboard stand"},
      {"role": "Bass", "name": "Marcus Johnson", "notes": "Upright bass provided"},
      {"role": "Drums", "name": "James Wilson", "notes": "Full kit provided"},
      {"role": "Saxophone", "name": "Alex Rivera", "notes": "Tenor sax"}
    ]'::jsonb,
    'Autumn Leaves - Joseph Kosma - Am
Blue Moon - Richard Rodgers - F
Take Five - Paul Desmond - Eb minor
All of Me - Gerald Marks - C
Fly Me to the Moon - Bart Howard - C
Summertime - George Gershwin - Am
The Girl from Ipanema - Antônio Carlos Jobim - F',
    'Smart casual - dark colors preferred',
    'Full PA system provided. Piano is tuned. Bass amp and drum kit available. Bring your own instruments.',
    'Street parking available after 6 PM. Loading dock accessible from 131st Street entrance. Call venue for load-in assistance.',
    '$400 total, split evenly ($100 per person). Payment via Venmo after the show.',
    'Venue contact: Mike at (555) 123-4567. Sound check at 7:30 PM sharp.',
    'friday-night-jazz-session',
    'minimal',
    false
  ) ON CONFLICT (public_slug) DO NOTHING;

  -- Mock Gig 2: Vintage Poster Theme - Rock Show
  INSERT INTO public.gig_packs (
    owner_id,
    title,
    band_name,
    date,
    call_time,
    on_stage_time,
    venue_name,
    venue_address,
    venue_maps_url,
    lineup,
    setlist,
    dress_code,
    backline_notes,
    parking_notes,
    payment_notes,
    internal_notes,
    public_slug,
    theme,
    is_archived
  ) VALUES (
    test_user_id,
    'SUMMER ROCK FESTIVAL',
    'Thunder Road',
    CURRENT_DATE + INTERVAL '14 days',
    '16:00',
    '18:00',
    'The Warehouse',
    '1234 Music Row, Nashville, TN 37203',
    'https://maps.google.com/?q=The+Warehouse+Nashville',
    '[
      {"role": "Lead Vocals / Guitar", "name": "Jake Miller", "notes": "Main vocalist"},
      {"role": "Lead Guitar", "name": "Emma Davis", "notes": "Solo sections"},
      {"role": "Bass", "name": "Chris Taylor", "notes": "Backup vocals"},
      {"role": "Drums", "name": "Ryan Brown", "notes": "Hard hitter"},
      {"role": "Keys", "name": "Maya Patel", "notes": "Synth patches ready"}
    ]'::jsonb,
    'Thunder Road - Bruce Springsteen - E
Born to Run - Bruce Springsteen - E
Sweet Child O'' Mine - Guns N'' Roses - D
Don''t Stop Believin'' - Journey - E
Livin'' on a Prayer - Bon Jovi - D
Highway to Hell - AC/DC - A
We Will Rock You - Queen - Bb
Bohemian Rhapsody - Queen - Bb',
    'Rock attire - band t-shirts, jeans, leather jackets welcome',
    'Full backline: Marshall stacks, Ampeg SVT bass rig, full drum kit with cymbals. Keys: Nord Stage 3 provided. Bring your own guitars and pedals.',
    'Free parking lot behind venue. Load-in through side door. Security will direct you.',
    '$1,200 guarantee + 60% of door after 200 tickets. Payment within 3 business days via bank transfer.',
    'Festival coordinator: Lisa at lisa@summerrockfest.com. We''re the headliner - 90 minute set.',
    'summer-rock-festival',
    'vintage_poster',
    false
  ) ON CONFLICT (public_slug) DO NOTHING;

  -- Mock Gig 3: Social Card Theme - Acoustic Coffee House
  INSERT INTO public.gig_packs (
    owner_id,
    title,
    band_name,
    date,
    call_time,
    on_stage_time,
    venue_name,
    venue_address,
    venue_maps_url,
    lineup,
    setlist,
    dress_code,
    backline_notes,
    parking_notes,
    payment_notes,
    internal_notes,
    public_slug,
    theme,
    is_archived
  ) VALUES (
    test_user_id,
    'Acoustic Sunday Brunch',
    'The Morning Light Duo',
    CURRENT_DATE + INTERVAL '3 days',
    '10:00',
    '11:00',
    'Brew & Bean Coffee House',
    '456 Main Street, Portland, OR 97201',
    'https://maps.google.com/?q=Brew+Bean+Coffee+House+Portland',
    '[
      {"role": "Vocals / Guitar", "name": "Olivia Martinez", "notes": "Acoustic guitar"},
      {"role": "Vocals / Violin", "name": "Noah Kim", "notes": "Harmony vocals"}
    ]'::jsonb,
    'Blackbird - The Beatles - G
Hallelujah - Leonard Cohen - C
Landslide - Fleetwood Mac - C
Fast Car - Tracy Chapman - C
Fire and Rain - James Taylor - A
Both Sides Now - Joni Mitchell - C
The Sound of Silence - Simon & Garfunkel - Am',
    'Casual, comfortable - think Sunday brunch vibes',
    'Small PA system provided. Two vocal mics and one instrument mic. Acoustic-friendly space - no amps needed.',
    'Street parking available. Metered parking free on Sundays. Small parking lot behind building.',
    '$150 flat fee. Cash or Venmo at end of set.',
    'Contact: Manager Sam at (503) 555-7890. Set up in corner stage area. Keep volume moderate - brunch crowd.',
    'acoustic-sunday-brunch',
    'social_card',
    false
  ) ON CONFLICT (public_slug) DO NOTHING;

  -- Mock Gig 4: Minimal Theme - Corporate Event
  INSERT INTO public.gig_packs (
    owner_id,
    title,
    band_name,
    date,
    call_time,
    on_stage_time,
    venue_name,
    venue_address,
    venue_maps_url,
    lineup,
    setlist,
    dress_code,
    backline_notes,
    parking_notes,
    payment_notes,
    internal_notes,
    public_slug,
    theme,
    is_archived
  ) VALUES (
    test_user_id,
    'Corporate Holiday Party',
    'The Professional Ensemble',
    CURRENT_DATE + INTERVAL '21 days',
    '17:00',
    '19:00',
    'Grand Ballroom - Downtown Convention Center',
    '789 Business Blvd, Chicago, IL 60601',
    'https://maps.google.com/?q=Downtown+Convention+Center+Chicago',
    '[
      {"role": "Keyboard", "name": "David Lee", "notes": "Main arranger"},
      {"role": "Guitar", "name": "Jennifer Park", "notes": "Acoustic and electric"},
      {"role": "Bass", "name": "Michael Chen", "notes": "Upright and electric"},
      {"role": "Drums", "name": "Robert Garcia", "notes": "Electronic kit"},
      {"role": "Vocals", "name": "Amanda White", "notes": "Lead vocals"},
      {"role": "Vocals", "name": "Thomas Anderson", "notes": "Harmony vocals"}
    ]'::jsonb,
    'Set 1 (Cocktail Hour):
Happy - Pharrell Williams - F
Uptown Funk - Bruno Mars - Dm
Can''t Stop the Feeling - Justin Timberlake - C

Set 2 (Dinner):
Fly Me to the Moon - Frank Sinatra - C
The Way You Look Tonight - Jerome Kern - C
At Last - Etta James - Bb

Set 3 (Dancing):
Dancing Queen - ABBA - A
September - Earth, Wind & Fire - D
I Wanna Dance with Somebody - Whitney Houston - F#m',
    'All black formal attire - tuxedos and evening gowns',
    'Full professional sound system and stage lighting provided. Grand piano available. All equipment provided - just bring instruments.',
    'Valet parking included. Load-in through service entrance on 8th Street. Security will escort.',
    '$3,500 flat fee. Contract signed. Payment 50% upfront, 50% on completion. W-9 required.',
    'Event coordinator: Rachel Thompson, rthompson@corpevents.com, (312) 555-2468. Very formal event - maintain professional demeanor throughout.',
    'corporate-holiday-party',
    'minimal',
    false
  ) ON CONFLICT (public_slug) DO NOTHING;

  RAISE NOTICE 'Successfully inserted mock gig packs! Check your dashboard at /gigpacks';
END $$;

