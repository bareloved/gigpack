import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BandsClientPage from "./client-page";
import { Band } from "@/lib/types";

export const dynamic = "force-dynamic";

interface BandsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function BandsPage({
  params,
}: BandsPageProps) {
  console.time("bands-page-total");
  const { locale } = await params;
  console.time("bands-supabase-create");
  const supabase = await createClient();
  console.timeEnd("bands-supabase-create");

  // Check if user is authenticated
  console.time("bands-auth-check");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.timeEnd("bands-auth-check");

  if (!user) {
    redirect(`/${locale}/auth/sign-in`);
  }

  // Fetch user's bands
  console.time("bands-list-fetch");
  const { data: bands, error } = await supabase
    .from("bands")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  console.timeEnd("bands-list-fetch");

  if (error) {
    console.error("Error fetching bands:", error);
    return (
      <div className="py-8">
        <p className="text-destructive">Failed to load bands. Please try again.</p>
      </div>
    );
  }

  console.timeEnd("bands-page-total");
  return <BandsClientPage initialBands={bands as Band[]} />;
}

