import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Public API endpoint to fetch a gig pack by its public slug
 * This uses the service role client to bypass RLS
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Check if service role key is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createServiceClient();
    const { slug } = await params;

    const { data: gigPack, error } = await supabase
      .from("gig_packs")
      .select("*")
      .eq("public_slug", slug)
      .eq("is_archived", false)
      .single();

    if (error) {
      console.error("Supabase error fetching gig pack:", error.message, error.code);
      return NextResponse.json(
        { error: "Gig pack not found" },
        { status: 404 }
      );
    }

    if (!gigPack) {
      return NextResponse.json(
        { error: "Gig pack not found" },
        { status: 404 }
      );
    }

    // Remove internal notes and owner_id from the public response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { internal_notes, owner_id, ...publicGigPack } = gigPack;

    return NextResponse.json(publicGigPack);
  } catch (error) {
    console.error("Error fetching gig pack:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

