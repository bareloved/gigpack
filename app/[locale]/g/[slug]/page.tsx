import { PublicGigPackView } from "@/components/public-gigpack-view";
import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface PublicGigPackPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

async function getGigPack(slug: string) {
  try {
    // Fetch directly from Supabase to avoid self-fetch timeout on Vercel
    const supabase = createServiceClient();
    
    const { data: gigPack, error } = await supabase
      .from("gig_packs")
      .select("*")
      .eq("public_slug", slug)
      .eq("is_archived", false)
      .single();

    if (error || !gigPack) {
      return null;
    }

    // Remove internal notes and owner_id from the public response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { internal_notes, owner_id, ...publicGigPack } = gigPack;
    
    return publicGigPack;
  } catch (error) {
    console.error("Error fetching gig pack:", error);
    return null;
  }
}

export default async function PublicGigPackPage({ params }: PublicGigPackPageProps) {
  const { slug, locale } = await params;
  const gigPack = await getGigPack(slug);

  if (!gigPack) {
    notFound();
  }

  return <PublicGigPackView initialGigPack={gigPack} slug={slug} locale={locale} />;
}

export const dynamic = "force-dynamic";

