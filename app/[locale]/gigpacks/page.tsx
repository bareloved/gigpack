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
  // Performance instrumentation
  console.time("gigpacks-page-total");
  console.time("gigpacks-params-await");
  // Must await params and searchParams in Next.js 15/16
  await params; // Consume params to satisfy Next.js
  const resolvedSearchParams = await searchParams;
  console.timeEnd("gigpacks-params-await");
  
  console.time("gigpacks-supabase-create");
  const supabase = await createClient();
  console.timeEnd("gigpacks-supabase-create");

  // Determine if we should open create or edit drawer based on URL params
  let initialSheetState = getSheetState(resolvedSearchParams);
  let initialEditingGigPack: GigPack | null = null;

  // If editing, fetch the specific gig pack
  if (initialSheetState?.mode === "edit") {
    console.time("gigpacks-edit-fetch");
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
    console.timeEnd("gigpacks-edit-fetch");
  }

  // Fetch all non-archived gig packs for the list
  // Try with new columns first (gig_type, band_id), fall back to old columns if they don't exist
  let gigPacks: any[] | null = null;
  let queryError: any = null;

  console.time("gigpacks-list-fetch");
  // Start both queries in parallel for faster fallback handling
  const tryQuery = supabase
    .from("gig_packs")
    .select(
      "id, title, band_name, date, call_time, venue_name, public_slug, updated_at, created_at, gig_mood, gig_type, hero_image_url, band_logo_url, band_id",
    )
    .eq("is_archived", false)
    .order("date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  const fallbackQuery = supabase
      .from("gig_packs")
      .select(
        "id, title, band_name, date, call_time, venue_name, public_slug, updated_at, created_at, gig_mood, hero_image_url, band_logo_url",
      )
      .eq("is_archived", false)
      .order("date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

  // Execute both queries in parallel
  const [tryResult, fallbackResult] = await Promise.allSettled([
    tryQuery,
    fallbackQuery,
  ]);
  console.timeEnd("gigpacks-list-fetch");

  if (tryResult.status === "fulfilled" && !tryResult.value.error) {
    gigPacks = tryResult.value.data;
  } else if (fallbackResult.status === "fulfilled" && !fallbackResult.value.error) {
      // Add null values for missing columns
    gigPacks = (fallbackResult.value.data || []).map(gig => ({
        ...gig,
        gig_type: null,
        band_id: null,
      }));
  } else {
    queryError = tryResult.status === "rejected" ? tryResult.reason : tryResult.value.error;
  }

  console.timeEnd("gigpacks-page-total");
  // Render the client page with server-fetched data
  return (
    <GigPacksClientPage
      initialGigPacks={gigPacks || []}
      initialSheetState={initialSheetState}
      initialEditingGigPack={initialEditingGigPack}
    />
  );
}

