-- Insert 4 Additional Mock GigPacks with All Fields Filled
-- Run this after all previous migrations have been applied

DO $$
DECLARE
  test_user_id UUID := 'c14671fc-964f-4d29-a402-c4da634b5474'; -- Barel Oved
BEGIN

  -- Mock Gig 1: Vintage Poster Theme - Blues Festival
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
    setlist_structured,
    dress_code,
    backline_notes,
    parking_notes,
    payment_notes,
    internal_notes,
    public_slug,
    theme,
    is_archived,
    band_logo_url,
    hero_image_url,
    accent_color,
    poster_skin,
    packing_checklist,
    gig_mood
  ) VALUES (
    test_user_id,
    'Delta Blues Revival',
    'Muddy Waters Tribute Band',
    CURRENT_DATE + INTERVAL '10 days',
    '14:00',
    '16:30',
    'Chicago Blues Festival - Main Stage',
    '337 E Randolph St, Chicago, IL 60601',
    'https://maps.google.com/?q=Grant+Park+Chicago',
    '[
      {"role": "Lead Vocals / Harmonica", "name": "Big Joe Turner", "notes": "Bring backup harps in A, C, D"},
      {"role": "Lead Guitar", "name": "Lightnin'' Hopkins Jr.", "notes": "Slide guitar specialist"},
      {"role": "Rhythm Guitar", "name": "Memphis Slim", "notes": "12-string acoustic"},
      {"role": "Bass", "name": "Willie Dixon III", "notes": "Upright bass"},
      {"role": "Drums", "name": "Fred Below", "notes": "Shuffle master"}
    ]'::jsonb,
    'Hoochie Coochie Man - Muddy Waters - A
Got My Mojo Working - Muddy Waters - E
Mannish Boy - Muddy Waters - E
I''m Your Hoochie Coochie Man - Muddy Waters - A
Rollin'' Stone - Muddy Waters - E
I Just Want to Make Love to You - Muddy Waters - E
Honey Bee - Muddy Waters - G',
    '[
      {
        "id": "set-1",
        "name": "Opening Set",
        "songs": [
          {"id": "s1", "title": "Hoochie Coochie Man", "artist": "Muddy Waters", "key": "A", "tempo": "slow shuffle", "notes": "Open with harmonica intro"},
          {"id": "s2", "title": "Got My Mojo Working", "artist": "Muddy Waters", "key": "E", "tempo": "medium", "notes": "Crowd sing-along on chorus"},
          {"id": "s3", "title": "Mannish Boy", "artist": "Muddy Waters", "key": "E", "tempo": "slow", "notes": "Extended guitar solo"}
        ]
      },
      {
        "id": "set-2",
        "name": "Main Set",
        "songs": [
          {"id": "s4", "title": "Rollin'' Stone", "artist": "Muddy Waters", "key": "E", "tempo": "medium", "notes": "Build intensity"},
          {"id": "s5", "title": "I Just Want to Make Love to You", "artist": "Muddy Waters", "key": "E", "tempo": "driving", "notes": "Full band energy"},
          {"id": "s6", "title": "Honey Bee", "artist": "Muddy Waters", "key": "G", "tempo": "slow blues", "notes": "Close with harmonica outro"}
        ]
      }
    ]'::jsonb,
    'Blues attire - fedoras, suspenders, vintage looks welcome',
    'Full festival backline provided. Fender Twin Reverb amps. Drum kit with vintage Ludwig snare. Acoustic bass amp available.',
    'Artist parking passes at Gate C. Load-in 2 hours before set. Golf carts available for gear transport.',
    '$2,000 flat fee. Payment via check within 7 days. Meals and drinks provided.',
    'Stage manager: Carlos at (312) 555-BLUE. Sound check at 2:30 PM. 60-minute set.',
    'delta-blues-revival-fest',
    'vintage_poster',
    false,
    NULL,
    NULL,
    '#B8860B',
    'paper',
    '[
      {"id": "ck1", "label": "Harmonicas (A, C, D, E, G)"},
      {"id": "ck2", "label": "Slide guitar"},
      {"id": "ck3", "label": "12-string acoustic"},
      {"id": "ck4", "label": "Upright bass bow"},
      {"id": "ck5", "label": "Drum throne"},
      {"id": "ck6", "label": "Fedora hats"}
    ]'::jsonb,
    'High energy 🔥'
  ) ON CONFLICT (public_slug) DO NOTHING;

  -- Mock Gig 2: Social Card Theme - Wedding Reception
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
    setlist_structured,
    dress_code,
    backline_notes,
    parking_notes,
    payment_notes,
    internal_notes,
    public_slug,
    theme,
    is_archived,
    band_logo_url,
    hero_image_url,
    accent_color,
    poster_skin,
    packing_checklist,
    gig_mood
  ) VALUES (
    test_user_id,
    'Sarah & Mike''s Wedding',
    'The Celebration Band',
    CURRENT_DATE + INTERVAL '28 days',
    '15:00',
    '18:00',
    'Rosewood Manor Estate',
    '1250 Garden View Lane, Napa Valley, CA 94558',
    'https://maps.google.com/?q=Rosewood+Manor+Napa',
    '[
      {"role": "Lead Vocals / Keys", "name": "Jessica Reynolds", "notes": "First dance song lead"},
      {"role": "Guitar", "name": "Tommy Chen", "notes": "Acoustic for ceremony"},
      {"role": "Bass", "name": "Derek Williams", "notes": "Fretless for ballads"},
      {"role": "Drums", "name": "Maria Santos", "notes": "Brushes for dinner set"},
      {"role": "Saxophone", "name": "Kenny Rogers", "notes": "Smooth jazz fills"}
    ]'::jsonb,
    'Ceremony:
Canon in D - Pachelbel
Here Comes the Sun - The Beatles

First Dance:
At Last - Etta James

Dinner Set:
Fly Me to the Moon - Frank Sinatra
The Way You Look Tonight - Tony Bennett
L-O-V-E - Nat King Cole

Dancing:
I Gotta Feeling - Black Eyed Peas
Uptown Funk - Bruno Mars
Signed, Sealed, Delivered - Stevie Wonder',
    '[
      {
        "id": "ceremony",
        "name": "Ceremony",
        "songs": [
          {"id": "c1", "title": "Canon in D", "artist": "Pachelbel", "key": "D", "tempo": "66", "notes": "Processional - acoustic guitar only"},
          {"id": "c2", "title": "Here Comes the Sun", "artist": "The Beatles", "key": "A", "tempo": "126", "notes": "Bride entrance"}
        ]
      },
      {
        "id": "first-dance",
        "name": "First Dance",
        "songs": [
          {"id": "fd1", "title": "At Last", "artist": "Etta James", "key": "F", "tempo": "slow", "notes": "Full band - soft start, build to end"}
        ]
      },
      {
        "id": "dinner",
        "name": "Dinner Set",
        "songs": [
          {"id": "d1", "title": "Fly Me to the Moon", "artist": "Frank Sinatra", "key": "C", "tempo": "medium swing"},
          {"id": "d2", "title": "The Way You Look Tonight", "artist": "Tony Bennett", "key": "Eb", "tempo": "medium"},
          {"id": "d3", "title": "L-O-V-E", "artist": "Nat King Cole", "key": "G", "tempo": "130"}
        ]
      },
      {
        "id": "dancing",
        "name": "Dancing",
        "songs": [
          {"id": "da1", "title": "I Gotta Feeling", "artist": "Black Eyed Peas", "key": "G", "tempo": "128", "notes": "Open dance floor"},
          {"id": "da2", "title": "Uptown Funk", "artist": "Bruno Mars", "key": "Dm", "tempo": "115"},
          {"id": "da3", "title": "Signed, Sealed, Delivered", "artist": "Stevie Wonder", "key": "F", "tempo": "108"}
        ]
      }
    ]'::jsonb,
    'Formal - Black tie optional. Men: suits or tuxedos. Women: cocktail or evening wear.',
    'Venue provides: JBL EON 15 PA, 2 vocal mics, keyboard stand. We bring: drums, amps, keys. Acoustic guitar with pickup for ceremony.',
    'Guest parking in main lot. Band parking behind kitchen entrance. Load-in through service door.',
    '$4,500 total. 50% deposit paid. Remaining 50% due night of event. Meals included.',
    'Wedding planner: Amanda at amanda@rosewoodevents.com. Cake cutting at 8pm - play soft background. Last song: "Don''t Stop Believin''" per couple request.',
    'sarah-mike-wedding',
    'social_card',
    false,
    NULL,
    NULL,
    '#E8B4B8',
    'clean',
    '[
      {"id": "w1", "label": "Acoustic guitar with pickup"},
      {"id": "w2", "label": "Keyboard (Nord Stage)"},
      {"id": "w3", "label": "Drum kit with brushes"},
      {"id": "w4", "label": "Fretless bass"},
      {"id": "w5", "label": "Soprano sax"},
      {"id": "w6", "label": "Music stands (5)"},
      {"id": "w7", "label": "Black tie attire"},
      {"id": "w8", "label": "Backup strings/reeds"}
    ]'::jsonb,
    'Wedding 🕊️'
  ) ON CONFLICT (public_slug) DO NOTHING;

  -- Mock Gig 3: Minimal Theme - Indie Showcase
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
    setlist_structured,
    dress_code,
    backline_notes,
    parking_notes,
    payment_notes,
    internal_notes,
    public_slug,
    theme,
    is_archived,
    band_logo_url,
    hero_image_url,
    accent_color,
    poster_skin,
    packing_checklist,
    gig_mood
  ) VALUES (
    test_user_id,
    'Indie Night at The Basement',
    'Neon Dreams',
    CURRENT_DATE + INTERVAL '5 days',
    '20:00',
    '22:30',
    'The Basement',
    '1604 8th Ave S, Nashville, TN 37203',
    'https://maps.google.com/?q=The+Basement+Nashville',
    '[
      {"role": "Vocals / Synth", "name": "Luna Park", "notes": "Lead synth patches on USB"},
      {"role": "Guitar / Loops", "name": "River Stone", "notes": "Loop pedal operator"},
      {"role": "Bass / Keys", "name": "Sage Miller", "notes": "Switching between songs"},
      {"role": "Drums / Percussion", "name": "Phoenix Ray", "notes": "Electronic pads for 3 songs"}
    ]'::jsonb,
    'Electric Youth - original
Midnight City - M83 (cover)
Retrograde - James Blake (cover)
Neon Lights - original
Crystal Caves - original
Synthwave Dreams - original
Fading Stars - original',
    '[
      {
        "id": "main-set",
        "name": "Main Set",
        "songs": [
          {"id": "i1", "title": "Electric Youth", "artist": "Original", "key": "Em", "tempo": "118", "notes": "Synth intro - 8 bars"},
          {"id": "i2", "title": "Midnight City", "artist": "M83", "key": "A", "tempo": "105", "notes": "Extended sax solo sample"},
          {"id": "i3", "title": "Retrograde", "artist": "James Blake", "key": "E", "tempo": "slow", "notes": "Sparse arrangement"},
          {"id": "i4", "title": "Neon Lights", "artist": "Original", "key": "Bm", "tempo": "124", "notes": "Drop at 2:30"},
          {"id": "i5", "title": "Crystal Caves", "artist": "Original", "key": "F#m", "tempo": "98", "notes": "Loop pedal build"}
        ]
      },
      {
        "id": "encore",
        "name": "Encore",
        "songs": [
          {"id": "i6", "title": "Synthwave Dreams", "artist": "Original", "key": "Dm", "tempo": "128", "notes": "Full energy"},
          {"id": "i7", "title": "Fading Stars", "artist": "Original", "key": "C", "tempo": "ballad", "notes": "Acoustic ending"}
        ]
      }
    ]'::jsonb,
    'Wear whatever feels right - express yourself',
    'House PA and monitors. Backline: Fender Hot Rod Deluxe, Ampeg B-15, basic drum kit. BRING: synths, loop pedals, electronic pads.',
    'Street parking on 8th Ave. Venue has small lot - first come first served. Load-in through front door.',
    '$300 guarantee + 80% door after first 50 tickets. Pay at end of night, cash or Venmo.',
    'Booker: Jamie at jamie@thebasementnash.com. We''re second of three bands. 45-minute set. Merch table available.',
    'indie-night-basement',
    'minimal',
    false,
    NULL,
    NULL,
    '#7C3AED',
    NULL,
    '[
      {"id": "n1", "label": "Synth (Moog Sub 37)"},
      {"id": "n2", "label": "Loop pedal (RC-505)"},
      {"id": "n3", "label": "Electronic drum pads"},
      {"id": "n4", "label": "Laptop with Ableton"},
      {"id": "n5", "label": "Audio interface"},
      {"id": "n6", "label": "All cables and power"},
      {"id": "n7", "label": "Merch (shirts, vinyl)"}
    ]'::jsonb,
    'Club night 🌃'
  ) ON CONFLICT (public_slug) DO NOTHING;

  -- Mock Gig 4: Social Card Theme - Jazz Brunch
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
    setlist_structured,
    dress_code,
    backline_notes,
    parking_notes,
    payment_notes,
    internal_notes,
    public_slug,
    theme,
    is_archived,
    band_logo_url,
    hero_image_url,
    accent_color,
    poster_skin,
    packing_checklist,
    gig_mood
  ) VALUES (
    test_user_id,
    'Sunday Jazz Brunch',
    'The Velvet Trio',
    CURRENT_DATE + INTERVAL '2 days',
    '09:30',
    '10:30',
    'The Garden Room at Hotel Marmont',
    '8221 Sunset Blvd, Los Angeles, CA 90046',
    'https://maps.google.com/?q=Chateau+Marmont+Los+Angeles',
    '[
      {"role": "Piano", "name": "Charles Mingus Jr.", "notes": "Steinway on site"},
      {"role": "Upright Bass", "name": "Esperanza Williams", "notes": "Bowing for ballads"},
      {"role": "Drums / Brushes", "name": "Art Taylor II", "notes": "Brushes only - no sticks"}
    ]'::jsonb,
    'Take the A Train - Duke Ellington
Autumn Leaves - Joseph Kosma
My Funny Valentine - Rodgers & Hart
Blue in Green - Miles Davis
Misty - Erroll Garner
Body and Soul - Johnny Green
In a Sentimental Mood - Duke Ellington',
    '[
      {
        "id": "first-set",
        "name": "First Set (10:30-11:15)",
        "songs": [
          {"id": "j1", "title": "Take the A Train", "artist": "Duke Ellington", "key": "C", "tempo": "medium swing", "notes": "Classic opener"},
          {"id": "j2", "title": "Autumn Leaves", "artist": "Joseph Kosma", "key": "Gm", "tempo": "ballad", "notes": "Piano solo first"},
          {"id": "j3", "title": "My Funny Valentine", "artist": "Rodgers & Hart", "key": "Cm", "tempo": "rubato", "notes": "Bass bowing intro"},
          {"id": "j4", "title": "Blue in Green", "artist": "Miles Davis", "key": "modal", "tempo": "slow", "notes": "Sparse and delicate"}
        ]
      },
      {
        "id": "second-set",
        "name": "Second Set (11:30-12:15)",
        "songs": [
          {"id": "j5", "title": "Misty", "artist": "Erroll Garner", "key": "Eb", "tempo": "ballad", "notes": "Crowd favorite"},
          {"id": "j6", "title": "Body and Soul", "artist": "Johnny Green", "key": "Db", "tempo": "slow ballad", "notes": "Rubato intro"},
          {"id": "j7", "title": "In a Sentimental Mood", "artist": "Duke Ellington", "key": "F", "tempo": "slow", "notes": "Beautiful closer"}
        ]
      }
    ]'::jsonb,
    'Smart casual - Sunday brunch elegant. No jeans or t-shirts.',
    'Steinway Model B grand piano on site. Small PA for bass DI only. Drums: Jazz kit with 18" kick, provided. BRING: upright bass, sticks/brushes.',
    'Valet parking $20 (tip). Or street parking on Sunset. Load-in through garden entrance.',
    '$600 for trio split 3 ways. Payment end of gig via check. Complimentary brunch included.',
    'Restaurant manager: Pierre at pierre@chateaumarmont.com. Keep volume conversation-level. Two 45-min sets with 15-min break.',
    'sunday-jazz-brunch-marmont',
    'social_card',
    false,
    NULL,
    NULL,
    '#D4AF37',
    'clean',
    '[
      {"id": "jz1", "label": "Upright bass"},
      {"id": "jz2", "label": "Bass bow"},
      {"id": "jz3", "label": "Brushes and mallets"},
      {"id": "jz4", "label": "Real Book (just in case)"},
      {"id": "jz5", "label": "Smart casual outfit"}
    ]'::jsonb,
    'Jazz vibes 🎺'
  ) ON CONFLICT (public_slug) DO NOTHING;

  RAISE NOTICE 'Successfully inserted 4 new mock gig packs!';
END $$;

