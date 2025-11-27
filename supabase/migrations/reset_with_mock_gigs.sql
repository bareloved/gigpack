-- Reset GigPacks with 10 Feature-Rich Mock Gigs
-- WARNING: This will DELETE all existing gig packs!
-- Run this to test all features with diverse sample data.

-- Step 1: Delete all existing gig packs
DELETE FROM public.gig_packs;

-- Step 2: Insert 10 diverse mock gigs
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Get the first user from auth.users
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please sign up first.';
  END IF;

  -- ============================================================================
  -- GIG 1: Vintage Poster + Paper Skin + High Energy
  -- Full-featured rock show with everything filled in
  -- ============================================================================
  INSERT INTO public.gig_packs (
    owner_id, title, band_name, date, call_time, on_stage_time,
    venue_name, venue_address, venue_maps_url, lineup,
    setlist, setlist_structured, dress_code, backline_notes,
    parking_notes, payment_notes, internal_notes, public_slug,
    theme, poster_skin, accent_color, gig_mood, packing_checklist, is_archived
  ) VALUES (
    test_user_id,
    'ELECTRIC THUNDER TOUR',
    'The Voltage',
    CURRENT_DATE + INTERVAL '5 days',
    '17:00',
    '21:00',
    'The Electric Factory',
    '421 N 7th St, Philadelphia, PA 19123',
    'https://maps.google.com/?q=The+Electric+Factory+Philadelphia',
    '[
      {"role": "Lead Vocals / Guitar", "name": "Max Sterling", "notes": "Fender Strat - bring backup"},
      {"role": "Lead Guitar", "name": "Zoe Chen", "notes": "Gibson Les Paul"},
      {"role": "Bass", "name": "Derek Williams", "notes": "Fender Jazz Bass"},
      {"role": "Drums", "name": "Nina Vasquez", "notes": "Full kit provided"},
      {"role": "Keys / Synth", "name": "Jordan Blake", "notes": "Nord Stage 3"}
    ]'::jsonb,
    NULL,
    '[
      {
        "id": "set1",
        "name": "Set 1 - Opening",
        "songs": [
          {"id": "s1", "title": "Thunderstrike", "artist": "Original", "key": "E", "tempo": "140", "notes": "Start with the build-up intro"},
          {"id": "s2", "title": "Neon Nights", "artist": "Original", "key": "Am", "tempo": "128", "notes": "Extended guitar solo"},
          {"id": "s3", "title": "Back in Black", "artist": "AC/DC", "key": "E", "tempo": "92", "notes": "Crowd sing-along"},
          {"id": "s4", "title": "Electric Feel", "artist": "MGMT", "key": "Dm", "tempo": "108", "notes": "Synth-heavy arrangement"}
        ]
      },
      {
        "id": "set2",
        "name": "Set 2 - Peak Energy",
        "songs": [
          {"id": "s5", "title": "Highway Star", "artist": "Deep Purple", "key": "G", "tempo": "170", "notes": "Jon Lord style keys"},
          {"id": "s6", "title": "Voltage", "artist": "Original", "key": "D", "tempo": "145", "notes": "Title track - pyro cue"},
          {"id": "s7", "title": "Sweet Child O'' Mine", "artist": "Guns N'' Roses", "key": "D", "tempo": "125", "notes": "Classic arrangement"}
        ]
      },
      {
        "id": "encore",
        "name": "Encore",
        "songs": [
          {"id": "s8", "title": "Bohemian Rhapsody", "artist": "Queen", "key": "Bb", "tempo": "Various", "notes": "Full arrangement with opera section"},
          {"id": "s9", "title": "We Will Rock You / We Are The Champions", "artist": "Queen", "key": "A/C", "tempo": "81/66", "notes": "Medley - big finish"}
        ]
      }
    ]'::jsonb,
    'All black with band logo tees available backstage',
    'Full backline provided: Marshall JCM800 stacks, Ampeg SVT, Pearl Masters kit. IEM system available. Bring your own instruments and pedals.',
    'Load-in at loading dock on 8th St. Crew parking in reserved lot. Artist parking passes will be at will-call.',
    '$2,500 guarantee + merch split 80/20. Payment via wire within 5 business days.',
    'Tour manager contact: Steve 555-0123. Catering rider confirmed. Green room has showers.',
    'electric-thunder-tour',
    'vintage_poster',
    'paper',
    '#FF4500',
    'High energy 🔥',
    '[
      {"id": "p1", "label": "Guitar (main)"},
      {"id": "p2", "label": "Guitar (backup)"},
      {"id": "p3", "label": "Pedalboard"},
      {"id": "p4", "label": "In-ears"},
      {"id": "p5", "label": "Ear plugs (backup)"},
      {"id": "p6", "label": "Band merch"},
      {"id": "p7", "label": "Stage clothes"}
    ]'::jsonb,
    false
  );

  -- ============================================================================
  -- GIG 2: Minimal Theme + Wedding Mood
  -- Elegant wedding with structured setlist
  -- ============================================================================
  INSERT INTO public.gig_packs (
    owner_id, title, band_name, date, call_time, on_stage_time,
    venue_name, venue_address, venue_maps_url, lineup,
    setlist, setlist_structured, dress_code, backline_notes,
    parking_notes, payment_notes, internal_notes, public_slug,
    theme, accent_color, gig_mood, packing_checklist, is_archived
  ) VALUES (
    test_user_id,
    'Sarah & James Wedding',
    'The Moonlight Orchestra',
    CURRENT_DATE + INTERVAL '12 days',
    '15:00',
    '17:30',
    'Rosewood Manor Estate',
    '1500 Garden View Lane, Napa Valley, CA 94558',
    'https://maps.google.com/?q=Rosewood+Manor+Napa',
    '[
      {"role": "Bandleader / Keys", "name": "Michael Torres", "notes": "MC duties during reception"},
      {"role": "Vocals", "name": "Sophia Adams", "notes": "Ceremony soloist"},
      {"role": "Violin", "name": "Emily Park", "notes": "Ceremony quartet"},
      {"role": "Cello", "name": "David Lin", "notes": "Ceremony quartet"},
      {"role": "Guitar", "name": "Alex Romano", "notes": "Acoustic for ceremony, electric for reception"},
      {"role": "Bass", "name": "Chris Martinez", "notes": "Upright for cocktails"},
      {"role": "Drums", "name": "Ryan Cooper", "notes": "Brushes for dinner, sticks for dancing"}
    ]'::jsonb,
    NULL,
    '[
      {
        "id": "ceremony",
        "name": "Ceremony",
        "songs": [
          {"id": "c1", "title": "Canon in D", "artist": "Pachelbel", "key": "D", "notes": "Bridal processional"},
          {"id": "c2", "title": "A Thousand Years", "artist": "Christina Perri", "key": "Bb", "notes": "Bride entrance"},
          {"id": "c3", "title": "Marry Me", "artist": "Train", "key": "C", "notes": "Unity ceremony"},
          {"id": "c4", "title": "All You Need Is Love", "artist": "The Beatles", "key": "G", "notes": "Recessional"}
        ]
      },
      {
        "id": "cocktails",
        "name": "Cocktail Hour",
        "songs": [
          {"id": "k1", "title": "The Way You Look Tonight", "artist": "Frank Sinatra", "key": "C"},
          {"id": "k2", "title": "Fly Me to the Moon", "artist": "Frank Sinatra", "key": "C"},
          {"id": "k3", "title": "L-O-V-E", "artist": "Nat King Cole", "key": "G"},
          {"id": "k4", "title": "At Last", "artist": "Etta James", "key": "F"}
        ]
      },
      {
        "id": "firstdances",
        "name": "Special Dances",
        "songs": [
          {"id": "f1", "title": "Perfect", "artist": "Ed Sheeran", "key": "Ab", "notes": "FIRST DANCE - couple requested slower tempo"},
          {"id": "f2", "title": "My Girl", "artist": "The Temptations", "key": "C", "notes": "Father-daughter dance"},
          {"id": "f3", "title": "What a Wonderful World", "artist": "Louis Armstrong", "key": "F", "notes": "Mother-son dance"}
        ]
      },
      {
        "id": "party",
        "name": "Dance Party",
        "songs": [
          {"id": "d1", "title": "Uptown Funk", "artist": "Bruno Mars", "key": "Dm"},
          {"id": "d2", "title": "I Wanna Dance with Somebody", "artist": "Whitney Houston", "key": "G"},
          {"id": "d3", "title": "September", "artist": "Earth Wind & Fire", "key": "Cm"},
          {"id": "d4", "title": "Signed Sealed Delivered", "artist": "Stevie Wonder", "key": "F"},
          {"id": "d5", "title": "Shout", "artist": "Isley Brothers", "key": "F", "notes": "Extended version - crowd participation"}
        ]
      }
    ]'::jsonb,
    'Formal black tie for all musicians',
    'Grand piano on-site. Full PA and lighting provided by venue. Bring own instruments.',
    'Staff parking behind the estate. Vendors enter via service road.',
    '$4,500 total. 50% deposit received. Remaining balance due day of event.',
    'Wedding coordinator: Lisa Chen (510) 555-8901. Meal provided at 6pm. Photos with band at 4:30pm.',
    'sarah-james-wedding',
    'minimal',
    '#D4AF37',
    'Wedding 🕊️',
    '[
      {"id": "w1", "label": "Formal attire"},
      {"id": "w2", "label": "Sheet music binder"},
      {"id": "w3", "label": "Violin (main)"},
      {"id": "w4", "label": "Cello"},
      {"id": "w5", "label": "Music stands"},
      {"id": "w6", "label": "Stand lights"}
    ]'::jsonb,
    false
  );

  -- ============================================================================
  -- GIG 3: Social Card Theme + Jazz Vibes
  -- Intimate jazz club gig
  -- ============================================================================
  INSERT INTO public.gig_packs (
    owner_id, title, band_name, date, call_time, on_stage_time,
    venue_name, venue_address, venue_maps_url, lineup,
    setlist, setlist_structured, dress_code, backline_notes,
    parking_notes, payment_notes, internal_notes, public_slug,
    theme, accent_color, gig_mood, packing_checklist, is_archived
  ) VALUES (
    test_user_id,
    'Late Night at the Blue Room',
    'The Dizzy Gillespie Tribute',
    CURRENT_DATE + INTERVAL '3 days',
    '20:00',
    '22:00',
    'The Blue Room Jazz Club',
    '18th & Vine, Kansas City, MO 64108',
    'https://maps.google.com/?q=Blue+Room+Jazz+Kansas+City',
    '[
      {"role": "Trumpet", "name": "Marcus Bell", "notes": "Flugelhorn for ballads"},
      {"role": "Piano", "name": "Yuki Tanaka", "notes": "Steinway on-site"},
      {"role": "Upright Bass", "name": "Charles Washington", "notes": "Bring own bass"},
      {"role": "Drums", "name": "Jerome Ellis", "notes": "Brushes and mallets"}
    ]'::jsonb,
    NULL,
    '[
      {
        "id": "set1",
        "name": "First Set",
        "songs": [
          {"id": "j1", "title": "A Night in Tunisia", "artist": "Dizzy Gillespie", "key": "Dm", "tempo": "Medium up", "notes": "Classic bebop head"},
          {"id": "j2", "title": "Con Alma", "artist": "Dizzy Gillespie", "key": "Eb", "tempo": "Ballad"},
          {"id": "j3", "title": "Groovin'' High", "artist": "Dizzy Gillespie", "key": "Eb", "tempo": "Fast"},
          {"id": "j4", "title": "Manteca", "artist": "Dizzy Gillespie", "key": "Bb", "tempo": "Afro-Cuban", "notes": "Extended percussion section"}
        ]
      },
      {
        "id": "set2",
        "name": "Second Set",
        "songs": [
          {"id": "j5", "title": "Woody ''n You", "artist": "Dizzy Gillespie", "key": "Db", "tempo": "Medium"},
          {"id": "j6", "title": "Birks'' Works", "artist": "Dizzy Gillespie", "key": "F", "tempo": "Medium swing"},
          {"id": "j7", "title": "Salt Peanuts", "artist": "Dizzy Gillespie", "key": "F", "tempo": "Fast", "notes": "Audience callback"}
        ]
      }
    ]'::jsonb,
    'Smart casual - no jeans',
    'House drum kit available. Steinway B grand piano. Vocal PA only - acoustic jazz setting.',
    'Street parking. Metered until 6pm, free after.',
    '$150 per musician + tips. Cash end of night.',
    'Club owner: Big Mike. Two sets, 45 mins each with 20 min break.',
    'blue-room-dizzy-tribute',
    'social_card',
    '#1E90FF',
    'Jazz vibes 🎺',
    '[
      {"id": "jz1", "label": "Trumpet"},
      {"id": "jz2", "label": "Flugelhorn"},
      {"id": "jz3", "label": "Mutes (harmon, cup, straight)"},
      {"id": "jz4", "label": "Real Book"}
    ]'::jsonb,
    false
  );

  -- ============================================================================
  -- GIG 4: Vintage Poster + Grain Skin + Club Night
  -- EDM/Dance club night
  -- ============================================================================
  INSERT INTO public.gig_packs (
    owner_id, title, band_name, date, call_time, on_stage_time,
    venue_name, venue_address, venue_maps_url, lineup,
    setlist, setlist_structured, dress_code, backline_notes,
    parking_notes, payment_notes, internal_notes, public_slug,
    theme, poster_skin, accent_color, gig_mood, packing_checklist, is_archived
  ) VALUES (
    test_user_id,
    'NEON DREAMS',
    'DJ Prism & The Light Collective',
    CURRENT_DATE + INTERVAL '8 days',
    '22:00',
    '00:30',
    'Warehouse 23',
    '23 Industrial Blvd, Brooklyn, NY 11222',
    'https://maps.google.com/?q=Warehouse+23+Brooklyn',
    '[
      {"role": "DJ / Producer", "name": "DJ Prism", "notes": "Pioneer CDJ-3000 setup"},
      {"role": "Live Synths", "name": "Luna Vox", "notes": "Moog + Prophet"},
      {"role": "Visuals / VJ", "name": "Pixel Dreams", "notes": "Resolume setup"}
    ]'::jsonb,
    NULL,
    '[
      {
        "id": "warmup",
        "name": "Warm Up (12:30-1:30)",
        "songs": [
          {"id": "e1", "title": "Ambient Intro", "tempo": "100-110 BPM", "notes": "Build atmosphere"},
          {"id": "e2", "title": "Deep House Set", "tempo": "118-122 BPM"}
        ]
      },
      {
        "id": "peak",
        "name": "Peak Time (1:30-3:00)",
        "songs": [
          {"id": "e3", "title": "Tech House Transition", "tempo": "124-126 BPM"},
          {"id": "e4", "title": "Main Room Energy", "tempo": "126-128 BPM", "notes": "Drop the bangers"},
          {"id": "e5", "title": "Prism Originals Block", "tempo": "128 BPM", "notes": "3-4 unreleased tracks"}
        ]
      },
      {
        "id": "closing",
        "name": "Closing (3:00-4:00)",
        "songs": [
          {"id": "e6", "title": "Melodic Techno Wind Down", "tempo": "124-122 BPM"},
          {"id": "e7", "title": "Ethereal Closer", "tempo": "115 BPM", "notes": "Leave them floating"}
        ]
      }
    ]'::jsonb,
    'All black. Glow accessories welcome.',
    'Pioneer CDJ-3000 x 4, DJM-V10 mixer. Full d&b Audiotechnik sound system. Video wall for VJ.',
    'No parking at venue. Uber/taxi recommended. Load-in 9pm via back alley.',
    '$800 + rider. Payment Venmo before set.',
    'Promoter: Alex @neonbrooklyn. Expected crowd 400+. After-party at different location.',
    'neon-dreams-brooklyn',
    'vintage_poster',
    'grain',
    '#FF00FF',
    'Club night 🌃',
    '[
      {"id": "dj1", "label": "USB drives (x3)"},
      {"id": "dj2", "label": "Laptop (backup)"},
      {"id": "dj3", "label": "Headphones"},
      {"id": "dj4", "label": "Midi controller"},
      {"id": "dj5", "label": "Cables (RCA, USB, HDMI)"}
    ]'::jsonb,
    false
  );

  -- ============================================================================
  -- GIG 5: Minimal Theme + Corporate
  -- Tech company launch party
  -- ============================================================================
  INSERT INTO public.gig_packs (
    owner_id, title, band_name, date, call_time, on_stage_time,
    venue_name, venue_address, venue_maps_url, lineup,
    setlist, setlist_structured, dress_code, backline_notes,
    parking_notes, payment_notes, internal_notes, public_slug,
    theme, accent_color, gig_mood, packing_checklist, is_archived
  ) VALUES (
    test_user_id,
    'TechCorp Product Launch',
    'The Silicon Strings',
    CURRENT_DATE + INTERVAL '18 days',
    '16:00',
    '18:30',
    'Innovation Center Atrium',
    '500 Tech Drive, San Jose, CA 95110',
    'https://maps.google.com/?q=500+Tech+Drive+San+Jose',
    '[
      {"role": "Keys / MD", "name": "Kevin Park", "notes": "Running Ableton for tracks"},
      {"role": "Guitar", "name": "Sara Chen", "notes": "Clean tones only"},
      {"role": "Bass", "name": "Mike Johnson", "notes": "5-string"},
      {"role": "Drums", "name": "Lisa Tran", "notes": "Electronic/acoustic hybrid"},
      {"role": "Vocals", "name": "Jordan Hayes", "notes": "Also handles announcements"}
    ]'::jsonb,
    NULL,
    '[
      {
        "id": "bg",
        "name": "Background (6:30-7:30)",
        "songs": [
          {"id": "c1", "title": "Instrumental Covers Medley", "notes": "Low volume during networking"},
          {"id": "c2", "title": "Chill Electronic Originals", "notes": "Ambient vibes"}
        ]
      },
      {
        "id": "presentation",
        "name": "During Presentation",
        "songs": [
          {"id": "c3", "title": "Fanfare/Stinger", "notes": "For product reveal moment"},
          {"id": "c4", "title": "Underscore", "notes": "Light background during demos"}
        ]
      },
      {
        "id": "party",
        "name": "After Party (8:30-10:00)",
        "songs": [
          {"id": "c5", "title": "Don''t Stop Believin''", "artist": "Journey", "key": "E"},
          {"id": "c6", "title": "Mr. Brightside", "artist": "The Killers", "key": "Db"},
          {"id": "c7", "title": "Valerie", "artist": "Mark Ronson", "key": "Eb"},
          {"id": "c8", "title": "Shut Up and Dance", "artist": "Walk The Moon", "key": "Db"},
          {"id": "c9", "title": "I Gotta Feeling", "artist": "Black Eyed Peas", "key": "G"}
        ]
      }
    ]'::jsonb,
    'Business casual - smart but not stuffy',
    'Full PA and lighting by venue AV team. Wireless in-ears provided. Stage plot submitted.',
    'Valet parking for band. Load-in at loading dock B.',
    '$3,000 flat. Contract signed. W-9 submitted. Net 30 payment.',
    'Event contact: Amanda Riley, events@techcorp.com. CEO speaking at 8pm - be ready for stinger.',
    'techcorp-launch-2025',
    'minimal',
    '#00D4AA',
    'Corporate ✨',
    '[
      {"id": "tc1", "label": "Laptop + interface"},
      {"id": "tc2", "label": "Backup tracks on USB"},
      {"id": "tc3", "label": "Business cards"},
      {"id": "tc4", "label": "Contracts (signed copy)"}
    ]'::jsonb,
    false
  );

  -- ============================================================================
  -- GIG 6: Social Card Theme + Acoustic
  -- Coffee shop acoustic set
  -- ============================================================================
  INSERT INTO public.gig_packs (
    owner_id, title, band_name, date, call_time, on_stage_time,
    venue_name, venue_address, venue_maps_url, lineup,
    setlist, setlist_structured, dress_code, backline_notes,
    parking_notes, payment_notes, internal_notes, public_slug,
    theme, accent_color, gig_mood, packing_checklist, is_archived
  ) VALUES (
    test_user_id,
    'Sunday Morning Sessions',
    'Honey & Rosemary',
    CURRENT_DATE + INTERVAL '2 days',
    '09:30',
    '10:00',
    'The Roasted Bean',
    '234 Oak Street, Austin, TX 78701',
    'https://maps.google.com/?q=Roasted+Bean+Austin',
    '[
      {"role": "Vocals / Guitar", "name": "Hannah Rose", "notes": "Taylor 814ce"},
      {"role": "Vocals / Ukulele", "name": "Maya Lin", "notes": "Harmony vocals"}
    ]'::jsonb,
    NULL,
    '[
      {
        "id": "morning",
        "name": "Morning Set",
        "songs": [
          {"id": "a1", "title": "Here Comes the Sun", "artist": "The Beatles", "key": "A"},
          {"id": "a2", "title": "Landslide", "artist": "Fleetwood Mac", "key": "C"},
          {"id": "a3", "title": "Fast Car", "artist": "Tracy Chapman", "key": "C"},
          {"id": "a4", "title": "Ho Hey", "artist": "The Lumineers", "key": "C"},
          {"id": "a5", "title": "Riptide", "artist": "Vance Joy", "key": "Am"},
          {"id": "a6", "title": "I Will Follow You Into the Dark", "artist": "Death Cab", "key": "F"}
        ]
      }
    ]'::jsonb,
    'Casual, comfortable',
    'Small PA provided - 2 vocal mics, 1 DI for guitar. Very intimate space.',
    'Street parking. Free on Sundays.',
    '$100 + tips + free coffee. Cash at end of set.',
    'Owner is Sam. Tip jar on counter. Set up in corner by window.',
    'sunday-roasted-bean',
    'social_card',
    '#8B4513',
    'Acoustic 🪕',
    '[
      {"id": "ac1", "label": "Acoustic guitar"},
      {"id": "ac2", "label": "Ukulele"},
      {"id": "ac3", "label": "Capo"},
      {"id": "ac4", "label": "Extra strings"},
      {"id": "ac5", "label": "Tip jar sign"}
    ]'::jsonb,
    false
  );

  -- ============================================================================
  -- GIG 7: Vintage Poster + Clean Skin + Laid Back
  -- Brewery blues night
  -- ============================================================================
  INSERT INTO public.gig_packs (
    owner_id, title, band_name, date, call_time, on_stage_time,
    venue_name, venue_address, venue_maps_url, lineup,
    setlist, setlist_structured, dress_code, backline_notes,
    parking_notes, payment_notes, internal_notes, public_slug,
    theme, poster_skin, accent_color, gig_mood, packing_checklist, is_archived
  ) VALUES (
    test_user_id,
    'BLUES & BREWS',
    'Muddy Waters Revival',
    CURRENT_DATE + INTERVAL '10 days',
    '18:00',
    '20:00',
    'Hopyard Brewing Co.',
    '789 Barrel Lane, Denver, CO 80205',
    'https://maps.google.com/?q=Hopyard+Brewing+Denver',
    '[
      {"role": "Vocals / Harmonica", "name": "Big Joe Turner Jr.", "notes": "Chromatic harp in C"},
      {"role": "Guitar", "name": "Slim Jackson", "notes": "ES-335 through Fender Twin"},
      {"role": "Bass", "name": "Willie Dixon III", "notes": "P-Bass"},
      {"role": "Drums", "name": "Sam Lay Jr.", "notes": "Vintage Ludwig kit"}
    ]'::jsonb,
    NULL,
    '[
      {
        "id": "set1",
        "name": "First Set",
        "songs": [
          {"id": "b1", "title": "Hoochie Coochie Man", "artist": "Muddy Waters", "key": "A"},
          {"id": "b2", "title": "The Thrill Is Gone", "artist": "B.B. King", "key": "Bm"},
          {"id": "b3", "title": "Stormy Monday", "artist": "T-Bone Walker", "key": "G"},
          {"id": "b4", "title": "Sweet Home Chicago", "artist": "Robert Johnson", "key": "E"}
        ]
      },
      {
        "id": "set2",
        "name": "Second Set",
        "songs": [
          {"id": "b5", "title": "Born Under a Bad Sign", "artist": "Albert King", "key": "C#m"},
          {"id": "b6", "title": "Red House", "artist": "Jimi Hendrix", "key": "Bb"},
          {"id": "b7", "title": "Pride and Joy", "artist": "SRV", "key": "E"},
          {"id": "b8", "title": "Mannish Boy", "artist": "Muddy Waters", "key": "A", "notes": "Extended jam - bring it home"}
        ]
      }
    ]'::jsonb,
    'Blues casual - hats encouraged',
    'Backline: Fender Twin Reverb, Ampeg B-15, house drum kit. Small stage - cozy.',
    'Lot behind brewery. First round on the house for musicians.',
    '$500 band pot + food/drink tab. Cash or Venmo.',
    'Brewmaster John is the contact. Two 45-min sets. Outdoor patio if weather permits.',
    'blues-brews-hopyard',
    'vintage_poster',
    'clean',
    '#DAA520',
    'Laid back 🍷',
    '[
      {"id": "bl1", "label": "Guitar"},
      {"id": "bl2", "label": "Harmonicas (A, C, E, G)"},
      {"id": "bl3", "label": "Amp (backup)"},
      {"id": "bl4", "label": "Fedora hat"}
    ]'::jsonb,
    false
  );

  -- ============================================================================
  -- GIG 8: Minimal Theme + Background
  -- Restaurant background music
  -- ============================================================================
  INSERT INTO public.gig_packs (
    owner_id, title, band_name, date, call_time, on_stage_time,
    venue_name, venue_address, venue_maps_url, lineup,
    setlist, setlist_structured, dress_code, backline_notes,
    parking_notes, payment_notes, internal_notes, public_slug,
    theme, accent_color, gig_mood, is_archived
  ) VALUES (
    test_user_id,
    'Thursday Dinner Service',
    'The Smooth Trio',
    CURRENT_DATE + INTERVAL '6 days',
    '17:30',
    '18:00',
    'Chez Marcel',
    '42 Bistro Row, Chicago, IL 60611',
    'https://maps.google.com/?q=Chez+Marcel+Chicago',
    '[
      {"role": "Piano", "name": "Pierre DuPont", "notes": "House Yamaha C3"},
      {"role": "Upright Bass", "name": "Jean-Luc Martin", "notes": "Bring own bass"},
      {"role": "Guitar", "name": "François Blanc", "notes": "Archtop, no amp"}
    ]'::jsonb,
    'Standards repertoire - play quiet background music. Take requests from guests.',
    NULL,
    'All black, formal',
    'Yamaha C3 grand piano. No amps - acoustic only. Very quiet - conversation volume.',
    'Valet for musicians. Enter through service entrance.',
    '$200 per musician. Weekly gig - paid monthly.',
    'Maitre d'' is Vincent. Stay unobtrusive. Dinner crowd likes it quiet. Free meal after 10pm.',
    'chez-marcel-thursdays',
    'minimal',
    '#2F4F4F',
    'Background 🎷',
    false
  );

  -- ============================================================================
  -- GIG 9: Social Card Theme + High Energy (minimal info)
  -- Last-minute sub gig
  -- ============================================================================
  INSERT INTO public.gig_packs (
    owner_id, title, band_name, date, call_time, on_stage_time,
    venue_name, venue_address, lineup,
    setlist, setlist_structured, public_slug,
    theme, gig_mood, is_archived
  ) VALUES (
    test_user_id,
    'EMERGENCY SUB - Read Notes!',
    'TBD',
    CURRENT_DATE + INTERVAL '1 day',
    '19:00',
    '20:00',
    'The Dive Bar',
    '123 Unknown St, Seattle, WA',
    '[
      {"role": "Bass", "name": "YOU", "notes": "Sub for regular bassist - call Mike for charts"}
    ]'::jsonb,
    'No setlist yet - contact bandleader',
    NULL,
    'emergency-sub-seattle',
    'social_card',
    'High energy 🔥',
    false
  );

  -- ============================================================================
  -- GIG 10: Vintage Poster + Paper Skin (Archived gig)
  -- Past festival - archived
  -- ============================================================================
  INSERT INTO public.gig_packs (
    owner_id, title, band_name, date, call_time, on_stage_time,
    venue_name, venue_address, venue_maps_url, lineup,
    setlist, setlist_structured, dress_code, backline_notes,
    parking_notes, payment_notes, internal_notes, public_slug,
    theme, poster_skin, accent_color, gig_mood, packing_checklist, is_archived
  ) VALUES (
    test_user_id,
    'SUNDOWN FESTIVAL 2024',
    'Desert Highway',
    CURRENT_DATE - INTERVAL '30 days',
    '14:00',
    '17:30',
    'Red Rocks Amphitheatre',
    '18300 W Alameda Pkwy, Morrison, CO 80465',
    'https://maps.google.com/?q=Red+Rocks+Amphitheatre',
    '[
      {"role": "Lead Vocals / Guitar", "name": "Dusty Rhodes", "notes": ""},
      {"role": "Lead Guitar", "name": "Sierra Dawn", "notes": ""},
      {"role": "Bass", "name": "Cactus Pete", "notes": ""},
      {"role": "Drums", "name": "Thunder Dan", "notes": ""},
      {"role": "Pedal Steel", "name": "Rusty Gates", "notes": ""}
    ]'::jsonb,
    NULL,
    '[
      {
        "id": "sunset",
        "name": "Sunset Set",
        "songs": [
          {"id": "f1", "title": "Desert Moon", "artist": "Original", "key": "E"},
          {"id": "f2", "title": "Highway Song", "artist": "Original", "key": "A"},
          {"id": "f3", "title": "Peaceful Easy Feeling", "artist": "Eagles", "key": "E"},
          {"id": "f4", "title": "Take It Easy", "artist": "Eagles", "key": "G"},
          {"id": "f5", "title": "Tequila Sunrise", "artist": "Eagles", "key": "G"},
          {"id": "f6", "title": "Sunset Rider", "artist": "Original", "key": "D", "notes": "Festival closer"}
        ]
      }
    ]'::jsonb,
    'Western wear - boots, hats, denim',
    'Full festival backline. IEMs mandatory.',
    'Artist parking pass required. Shuttle from lot to stage.',
    'Paid. $5,000 guarantee received.',
    'AMAZING GIG! Sold out crowd. Best sunset ever. Video coming soon.',
    'sundown-festival-2024',
    'vintage_poster',
    'paper',
    '#FF6B35',
    'High energy 🔥',
    '[
      {"id": "fest1", "label": "Telecaster"},
      {"id": "fest2", "label": "Pedal steel"},
      {"id": "fest3", "label": "Cowboy hat"},
      {"id": "fest4", "label": "Sunscreen"}
    ]'::jsonb,
    true  -- ARCHIVED
  );

  RAISE NOTICE '✅ Successfully created 10 mock gig packs!';
  RAISE NOTICE 'Themes: 3x minimal, 4x vintage_poster, 3x social_card';
  RAISE NOTICE 'Poster skins: clean, paper, grain';
  RAISE NOTICE 'Moods: wedding, jazz, corporate, club, acoustic, blues, background, high energy';
  RAISE NOTICE '1 archived gig (Sundown Festival) for testing archive feature';

END $$;

