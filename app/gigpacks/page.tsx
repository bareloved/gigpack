import { createClient } from "@/lib/supabase/server";
import { GigPacksClientPage, type GigPackSheetState } from "./client-page";
import type { GigPack } from "@/lib/types";

export const dynamic = "force-dynamic";

interface GigPacksPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

const getSheetState = (params?: Record<string, string | string[] | undefined>): GigPackSheetState | null => {
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

export default async function GigPacksPage({ searchParams }: GigPacksPageProps) {
  const supabase = await createClient();
  let initialSheetState = getSheetState(searchParams);
  let initialEditingGigPack: GigPack | null = null;

  if (initialSheetState?.mode === "edit") {
    const { data, error } = await supabase
      .from("gig_packs")
      .select("*")
      .eq("id", initialSheetState.gigPackId)
      .single();

    if (error || !data) {
      initialSheetState = null;
    } else {
      initialEditingGigPack = data;
    }
  }

  const { data: gigPacks } = await supabase
    .from("gig_packs")
    .select(
      "id, title, band_name, date, call_time, venue_name, public_slug, updated_at, created_at",
    )
    .eq("is_archived", false)
    .order("date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (
    <GigPacksClientPage
      initialGigPacks={gigPacks || []}
      initialSheetState={initialSheetState}
      initialEditingGigPack={initialEditingGigPack}
    />
  );
}

