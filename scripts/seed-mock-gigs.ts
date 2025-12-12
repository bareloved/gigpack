import { createClient } from "@supabase/supabase-js";
import { GigPackInsert } from "../lib/types";
import * as fs from "fs";
import * as path from "path";

// Load .env.local manually
const envLocalPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      process.env[key] = valueParts.join("=");
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Generate unique slug
function generateSlug(title: string, index: number): string {
  const base = title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
  return `${base}-${Date.now()}-${index}`;
}

async function seedMockGigs() {
  try {
    // Get the first user (you should have one from signing up)
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (usersError || !users || users.length === 0) {
      console.error("❌ No users found. Please sign up first!");
      process.exit(1);
    }

    const ownerId = users[0].id;
    console.log(`✅ Found user: ${ownerId}`);

    // 6 mock gigs with varied data
    const mockGigs: GigPackInsert[] = [
      {
        owner_id: ownerId,
        title: "Jazz Night at The Blue Note",
        band_id: null,
        band_name: "The Jazz Collective",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
        call_time: "18:00",
        on_stage_time: "19:30",
        venue_name: "The Blue Note",
        venue_address: "131 W 3rd St, New York, NY 10012",
        venue_maps_url: "https://maps.google.com/?q=The+Blue+Note+New+York",
        lineup: [
          { role: "Vocals", name: "Sarah Chen" },
          { role: "Piano", name: "Marcus Johnson" },
          { role: "Bass", name: "David Rodriguez" },
          { role: "Drums", name: "Alex Kim" },
        ],
        setlist: "Take Five - Dave Brubeck\nBlue in Green - Miles Davis\nSo What - Miles Davis",
        setlist_structured: null,
        dress_code: "Smart casual",
        backline_notes: "Venue provides drums. Bring own bass amp.",
        parking_notes: "Street parking available on 3rd St. Get there early.",
        payment_notes: "Split 60/40. Payment after show.",
        internal_notes: "Marcus might be late - have backup pianist ready.",
        public_slug: generateSlug("jazz-night-blue-note", 1),
        theme: "minimal",
        is_archived: false,
        band_logo_url: null,
        hero_image_url: null,
        accent_color: null,
        poster_skin: null,
        gig_type: "club_show",
        packing_checklist: [
          { id: "1", label: "Cables (XLR, 1/4)" },
          { id: "2", label: "Microphone stand" },
          { id: "3", label: "Backup strings" },
          { id: "4", label: "Music stands & charts" },
        ],
        materials: [
          { id: "1", label: "Set charts", url: "https://example.com/charts", kind: "charts" },
          { id: "2", label: "Rehearsal recording", url: "https://example.com/rehearsal", kind: "rehearsal" },
        ],
        schedule: [
          { id: "1", time: "18:00", label: "Arrive & soundcheck" },
          { id: "2", time: "19:00", label: "Meet & greet with band" },
          { id: "3", time: "19:30", label: "First set" },
          { id: "4", time: "20:30", label: "Break" },
          { id: "5", time: "20:45", label: "Second set" },
          { id: "6", time: "21:45", label: "Pack up & payment" },
        ],
      },
      {
        owner_id: ownerId,
        title: "Wedding Reception - Smith/Johnson",
        band_id: null,
        band_name: "The Celebration Band",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 14 days
        call_time: "16:00",
        on_stage_time: "17:00",
        venue_name: "The Grand Ballroom",
        venue_address: "456 Park Ave, Chicago, IL 60611",
        venue_maps_url: "https://maps.google.com/?q=Grand+Ballroom+Chicago",
        lineup: [
          { role: "Lead Vocals", name: "Emma Wilson" },
          { role: "Guitar", name: "Tom Brown" },
          { role: "Keys", name: "Lisa Park" },
          { role: "Drums", name: "Ryan Matthews" },
          { role: "Bass", name: "Chris Taylor" },
        ],
        setlist: "All of Me - John Legend\nFeel Like Home - Ed Sheeran\nPerfect - Ed Sheeran",
        setlist_structured: null,
        dress_code: "Black tie",
        backline_notes: "Venue provides PA system. We bring instruments only.",
        parking_notes: "Valet parking available. Ask for Wilson/Johnson wedding.",
        payment_notes: "$2,500 total. 50% due before, 50% after.",
        internal_notes: "Bride wants upbeat energy. Check setlist approval with family beforehand.",
        public_slug: generateSlug("wedding-smith-johnson", 2),
        theme: "vintage_poster",
        is_archived: false,
        band_logo_url: null,
        hero_image_url: null,
        accent_color: null,
        poster_skin: null,
        gig_type: "wedding",
        packing_checklist: [
          { id: "1", label: "Black tie/formal wear" },
          { id: "2", label: "Instrument(s)" },
          { id: "3", label: "All cables & adapters" },
          { id: "4", label: "Extra battery for wireless mic" },
          { id: "5", label: "Water bottles" },
        ],
        materials: [
          { id: "1", label: "Setlist (approved)", url: "https://example.com/wedding-setlist", kind: "performance" },
          { id: "2", label: "Bride contact", url: "https://example.com/bride-info", kind: "other" },
        ],
        schedule: [
          { id: "1", time: "16:00", label: "Arrive & setup" },
          { id: "2", time: "17:00", label: "Cocktail hour music" },
          { id: "3", time: "18:00", label: "Dinner music" },
          { id: "4", time: "19:00", label: "First dance & dancing" },
          { id: "5", time: "22:00", label: "Pack up" },
        ],
      },
      {
        owner_id: ownerId,
        title: "Stadium Rock Concert - National Tour",
        band_id: null,
        band_name: "Electric Horizon",
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 21 days
        call_time: "14:00",
        on_stage_time: "20:00",
        venue_name: "Madison Square Garden",
        venue_address: "33 Pennsylvania Plaza, New York, NY 10001",
        venue_maps_url: "https://maps.google.com/?q=Madison+Square+Garden",
        lineup: [
          { role: "Lead Vocals", name: "Jack Stone" },
          { role: "Lead Guitar", name: "Mike Powers" },
          { role: "Rhythm Guitar", name: "Danny West" },
          { role: "Bass", name: "Frank Rivers" },
          { role: "Drums", name: "Nick Velocity" },
          { role: "Keyboards", name: "Sam Keys" },
        ],
        setlist:
          "Electric Dream\nRiver of Fire\nWe Are One\nNeon Paradise\nStay With Me\nEncore: The Last Light",
        setlist_structured: null,
        dress_code: "Band merchandise required",
        backline_notes: "Provided by venue: drums, PA, monitors. Bring: instruments, cables.",
        parking_notes: "Secure underground parking. Band entrance on 8th Ave.",
        payment_notes: "$50,000 guaranteed. Sound/lights/security included.",
        internal_notes: "First major stadium gig! High production. Technical rehearsal at 3 PM sharp.",
        public_slug: generateSlug("stadium-rock-national-tour", 3),
        theme: "social_card",
        is_archived: false,
        band_logo_url: null,
        hero_image_url: null,
        accent_color: null,
        poster_skin: null,
        gig_type: "festival",
        packing_checklist: [
          { id: "1", label: "Instruments + cases" },
          { id: "2", label: "Backup instruments" },
          { id: "3", label: "All cables & wireless systems" },
          { id: "4", label: "Effect pedals & processors" },
          { id: "5", label: "Stands & hardware" },
          { id: "6", label: "Merch & t-shirts" },
        ],
        materials: [
          { id: "1", label: "Stage plot", url: "https://example.com/stage-plot", kind: "performance" },
          { id: "2", label: "Sound check notes", url: "https://example.com/soundcheck", kind: "reference" },
        ],
        schedule: [
          { id: "1", time: "14:00", label: "Arrive & load in" },
          { id: "2", time: "15:00", label: "Technical rehearsal" },
          { id: "3", time: "18:00", label: "Dinner break" },
          { id: "4", time: "19:30", label: "Soundcheck" },
          { id: "5", time: "20:00", label: "SHOWTIME" },
          { id: "6", time: "21:30", label: "Load out" },
        ],
      },
      {
        owner_id: ownerId,
        title: "Acoustic Duo - Coffee House",
        band_id: null,
        band_name: "Folk & Harmony",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 3 days
        call_time: "18:30",
        on_stage_time: "19:00",
        venue_name: "The Daily Grind Coffee House",
        venue_address: "789 Main St, Portland, OR 97204",
        venue_maps_url: "https://maps.google.com/?q=Daily+Grind+Portland",
        lineup: [
          { role: "Vocals & Guitar", name: "Sophie Green" },
          { role: "Vocals & Acoustic Guitar", name: "James Murphy" },
        ],
        setlist:
          "Sunrise Over Mountains\nLet It Be Me\nHome Is Where\nDreams in Harmony\nGoodbye Sweet Song",
        setlist_structured: null,
        dress_code: "Casual",
        backline_notes: "Acoustic performance. Minimal PA. Cafe will provide 2 mics.",
        parking_notes: "Street parking or paid lot nearby.",
        payment_notes: "Tip jar based. No guarantee, but coffee & food provided.",
        internal_notes: "Intimate setting. Keep energy warm and personal.",
        public_slug: generateSlug("acoustic-duo-coffee", 4),
        theme: "minimal",
        is_archived: false,
        band_logo_url: null,
        hero_image_url: null,
        accent_color: null,
        poster_skin: null,
        gig_type: "coffee_house",
        packing_checklist: [
          { id: "1", label: "Acoustic guitars" },
          { id: "2", label: "Capo & extra strings" },
          { id: "3", label: "Lyrics sheet" },
        ],
        materials: [
          { id: "1", label: "Rehearsal notes", url: "https://example.com/acoustic-rehearsal", kind: "rehearsal" },
        ],
        schedule: [
          { id: "1", time: "18:30", label: "Arrive & setup" },
          { id: "2", time: "19:00", label: "First set (45 min)" },
          { id: "3", time: "19:50", label: "Break" },
          { id: "4", time: "20:00", label: "Second set (45 min)" },
          { id: "5", time: "20:50", label: "Pack up" },
        ],
      },
      {
        owner_id: ownerId,
        title: "Corporate Gala - Tech Company Awards",
        band_id: null,
        band_name: "The Elegant Ensemble",
        date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 28 days
        call_time: "17:00",
        on_stage_time: "18:30",
        venue_name: "Silicon Valley Tech Center",
        venue_address: "1000 Innovation Drive, San Jose, CA 95110",
        venue_maps_url: "https://maps.google.com/?q=Tech+Center+San+Jose",
        lineup: [
          { role: "Violin", name: "Isabella Romano" },
          { role: "Cello", name: "Thomas White" },
          { role: "Piano", name: "Caroline Rose" },
        ],
        setlist: "Mozart - Eine kleine Nachtmusik\nBach - Air on G String\nVivaldi - Four Seasons (Spring)",
        setlist_structured: null,
        dress_code: "Black tie formal",
        backline_notes: "Classical strings. Venue provides steinway piano.",
        parking_notes: "Valet parking. Tech Center lobby entrance.",
        payment_notes: "$1,200 per musician. Paid via invoice within 30 days.",
        internal_notes: "High-profile event. Dress impeccably. Sound levels must be discreet.",
        public_slug: generateSlug("corporate-gala-tech", 5),
        theme: "vintage_poster",
        is_archived: false,
        band_logo_url: null,
        hero_image_url: null,
        accent_color: null,
        poster_skin: null,
        gig_type: "corporate",
        packing_checklist: [
          { id: "1", label: "Instrument in protective case" },
          { id: "2", label: "Bow & extra strings" },
          { id: "3", label: "Sheet music & stand" },
          { id: "4", label: "Black tie outfit (pressed)" },
        ],
        materials: [
          { id: "1", label: "Program notes", url: "https://example.com/program", kind: "performance" },
          { id: "2", label: "Repertoire list", url: "https://example.com/repertoire", kind: "reference" },
        ],
        schedule: [
          { id: "1", time: "17:00", label: "Arrive & setup" },
          { id: "2", time: "18:30", label: "Background music (cocktails)" },
          { id: "3", time: "19:30", label: "Formal performance" },
          { id: "4", time: "20:00", label: "More background music" },
          { id: "5", time: "21:00", label: "Pack up" },
        ],
      },
      {
        owner_id: ownerId,
        title: "Festival Set - Outdoor Summer Music Fest",
        band_id: null,
        band_name: "Desert Funk",
        date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 35 days
        call_time: "15:00",
        on_stage_time: "16:30",
        venue_name: "Summer Festival Main Stage",
        venue_address: "Desert Valley Park, Phoenix, AZ 85001",
        venue_maps_url: "https://maps.google.com/?q=Desert+Valley+Park",
        lineup: [
          { role: "Lead Vocals", name: "Rodney James" },
          { role: "Guitar", name: "Marcus Lee" },
          { role: "Bass", name: "Antoine Brown" },
          { role: "Drums", name: "Kevin White" },
          { role: "Keys", name: "Patricia Adams" },
        ],
        setlist:
          "Groove Temple\nFunky Revolution\nDance All Night\nSoulful Journey\nFestival Finale",
        setlist_structured: null,
        dress_code: "Festival wear - colorful & fun",
        backline_notes: "Festival provides PA, monitors, lights. Bring: instruments only.",
        parking_notes: "Parking lot E. Pass will be provided. Arrive early.",
        payment_notes: "$3,000 appearance fee. Paid day of show.",
        internal_notes: "High energy crowd. Lots of families. Keep it family-friendly & fun!",
        public_slug: generateSlug("festival-desert-funk", 6),
        theme: "social_card",
        is_archived: false,
        band_logo_url: null,
        hero_image_url: null,
        accent_color: null,
        poster_skin: null,
        gig_type: "festival",
        packing_checklist: [
          { id: "1", label: "Sunscreen & hat" },
          { id: "2", label: "Instruments & cables" },
          { id: "3", label: "Water & electrolytes" },
          { id: "4", label: "Colorful stage outfit" },
          { id: "5", label: "Backup battery pack" },
        ],
        materials: [
          { id: "1", label: "Festival info", url: "https://example.com/festival-info", kind: "other" },
          { id: "2", label: "Sound check sheet", url: "https://example.com/soundcheck-2", kind: "reference" },
        ],
        schedule: [
          { id: "1", time: "15:00", label: "Arrive & load in" },
          { id: "2", time: "15:45", label: "Soundcheck" },
          { id: "3", time: "16:15", label: "Final prep" },
          { id: "4", time: "16:30", label: "SHOWTIME" },
          { id: "5", time: "17:30", label: "Load out" },
          { id: "6", time: "18:30", label: "Enjoy festival!" },
        ],
      },
    ];

    // Insert all gigs
    const { data, error } = await supabase.from("gig_packs").insert(mockGigs).select();

    if (error) {
      console.error("❌ Error inserting gigs:", error);
      process.exit(1);
    }

    console.log(`✅ Successfully created ${data?.length || 0} mock gigs!`);
    console.log("\n📋 Created Gigs:");
    data?.forEach((gig, i) => {
      console.log(`  ${i + 1}. ${gig.title} (${gig.date})`);
    });
    console.log("\n✨ Your Gigmaster dashboard is now ready to explore!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedMockGigs();

