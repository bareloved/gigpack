import { PublicGigPackView } from "@/components/public-gigpack-view";
import { notFound } from "next/navigation";

interface PublicGigPackPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getGigPack(slug: string) {
  // Build base URL with proper precedence
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  
  try {
    const res = await fetch(`${baseUrl}/api/gigpack/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching gig pack:", error);
    return null;
  }
}

export default async function PublicGigPackPage({ params }: PublicGigPackPageProps) {
  const { slug } = await params;
  const gigPack = await getGigPack(slug);

  if (!gigPack) {
    notFound();
  }

  return <PublicGigPackView initialGigPack={gigPack} slug={slug} />;
}

export const dynamic = "force-dynamic";

