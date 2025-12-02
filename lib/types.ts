export interface Profile {
  id: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface LineupMember {
  role: string;
  name?: string;
  notes?: string;
}

// Structured Setlist Types (Setlist v2)
export interface SetlistSong {
  id: string;
  title: string;
  artist?: string;
  key?: string;
  tempo?: string; // Can be number like "120" or description like "ballad"
  notes?: string; // Rehearsal notes, watch-outs, etc.
  referenceUrl?: string; // For future use
}

export interface SetlistSection {
  id: string;
  name: string; // e.g. "Set 1", "Encore", "Extras"
  songs: SetlistSong[];
}

export type GigPackTheme = "minimal" | "vintage_poster" | "social_card";

export type PosterSkin = "clean" | "paper" | "grain";

// Packing Checklist Types
export interface PackingChecklistItem {
  id: string;      // Unique ID (UUID or stable string)
  label: string;   // e.g. "In-ears", "Sustain pedal"
}

// Local-only state for checkbox values (stored in localStorage)
export type PackingChecklistState = {
  [itemId: string]: boolean;
};

export interface GigPack {
  id: string;
  owner_id: string;
  title: string;
  band_name: string | null;
  date: string | null;
  call_time: string | null;
  on_stage_time: string | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_maps_url: string | null;
  lineup: LineupMember[] | null;
  setlist: string | null;
  setlist_structured: SetlistSection[] | null; // Setlist v2
  dress_code: string | null;
  backline_notes: string | null;
  parking_notes: string | null;
  payment_notes: string | null;
  internal_notes: string | null;
  public_slug: string;
  theme: GigPackTheme | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  // Branding fields
  band_logo_url: string | null;
  hero_image_url: string | null;
  accent_color: string | null;
  poster_skin: PosterSkin | null;
  // Packing checklist
  packing_checklist: PackingChecklistItem[] | null;
  // Gig mood - vibe/context tag
  gig_mood: string | null;
}

export type GigPackInsert = Omit<GigPack, "id" | "created_at" | "updated_at">;
export type GigPackUpdate = Partial<Omit<GigPack, "id" | "owner_id" | "public_slug" | "created_at">>;

// User Template Types
// Shared type for template default values (used by both built-in and user templates)
export interface GigPackTemplateDefaultValues {
  title?: string;
  bandName?: string;
  theme?: GigPackTheme;
  accentColor?: string;
  posterSkin?: PosterSkin;
  dateOffsetDays?: number;
  dressCode?: string;
  backlineNotes?: string;
  parkingNotes?: string;
  paymentNotes?: string;
  gigMood?: string;
  setlistStructured?: SetlistSection[];
  packingChecklist?: PackingChecklistItem[];
}

// User-created template stored in database
export interface UserTemplate {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  icon: string;
  default_values: GigPackTemplateDefaultValues;
  created_at: string;
  updated_at: string;
}

export type UserTemplateInsert = Omit<UserTemplate, "id" | "created_at" | "updated_at">;
export type UserTemplateUpdate = Partial<Omit<UserTemplate, "id" | "owner_id" | "created_at">>;

