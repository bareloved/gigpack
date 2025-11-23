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

export type GigPackTheme = "minimal" | "vintage_poster" | "social_card";

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
}

export type GigPackInsert = Omit<GigPack, "id" | "created_at" | "updated_at">;
export type GigPackUpdate = Partial<Omit<GigPack, "id" | "owner_id" | "public_slug" | "created_at">>;

