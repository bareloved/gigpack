import { createClient } from "@/lib/supabase/server";
import { GigPacksClientPage, type GigPackSheetState } from "./client-page";
import type { GigPack } from "@/lib/types";

export const dynamic = "force-dynamic";

// Next.js 15/16 requires params and searchParams to be Promises
interface GigPacksPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Helper function to parse searchParams and determine if we should open the create/edit drawer
const getSheetState = (
  params?: Record<string, string | string[] | undefined>,
): GigPackSheetState | null => {
  const sheetParam = params?.sheet;
  const sheet = Array.isArray(sheetParam) ? sheetParam[0] : sheetParam;
  if (sheet === "create") {
    return { mode: "create" };
  }
  if (sheet === "edit") {
    const idParam = params?.gigPackId;
    const gigPackId = Array.isArray(idParam) ? idParam[0] : idParam;
    if (gigPackId) {
      return { mode: "edit", gigPackId };
    }
  }
  return null;
};

export default async function GigPacksPage({
  params,
  searchParams,
}: GigPacksPageProps) {
  // Must await params and searchParams in Next.js 15/16
  await params; // Consume params to satisfy Next.js
  const resolvedSearchParams = await searchParams;
  
  const supabase = await createClient();

  // Determine if we should open create or edit drawer based on URL params
  let initialSheetState = getSheetState(resolvedSearchParams);
  let initialEditingGigPack: GigPack | null = null;

  // If editing, fetch the specific gig pack
  if (initialSheetState?.mode === "edit") {
    const { data, error } = await supabase
      .from("gig_packs")
      .select("*")
      .eq("id", initialSheetState.gigPackId)
      .single();

    if (error || !data) {
      // If fetch fails, don't open the edit drawer
      initialSheetState = null;
    } else {
      initialEditingGigPack = data;
    }
  }

  // Fetch all non-archived gig packs for the list
  const { data: gigPacks, error: queryError } = await supabase
    .from("gig_packs")
    .select(
      "id, title, band_name, date, call_time, venue_name, public_slug, updated_at, created_at, gig_type, hero_image_url, band_logo_url, band_id",
    )
    .eq("is_archived", false)
    .order("date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  // Handle query error gracefully
  if (queryError) {
    console.error("Error fetching gig packs:", queryError);
    // Return empty state instead of crashing
    return (
      <GigPacksClientPage
        initialGigPacks={[]}
        initialSheetState={initialSheetState}
        initialEditingGigPack={initialEditingGigPack}
      />
    );
  }

  // Ensure gigPacks is an array and handle missing columns
  const safeGigPacks = (gigPacks || []).map(gig => ({
    id: gig.id,
    title: gig.title,
    band_name: gig.band_name,
    date: gig.date,
    call_time: gig.call_time,
    venue_name: gig.venue_name,
    public_slug: gig.public_slug,
    updated_at: gig.updated_at,
    created_at: gig.created_at,
    gig_type: gig.gig_type || null,
    hero_image_url: gig.hero_image_url,
    band_logo_url: gig.band_logo_url,
    band_id: gig.band_id || null,
  }));

  // Render the client page with server-fetched data
  return (
    <GigPacksClientPage
      initialGigPacks={safeGigPacks}
      initialSheetState={initialSheetState}
      initialEditingGigPack={initialEditingGigPack}
    />
  );
}

