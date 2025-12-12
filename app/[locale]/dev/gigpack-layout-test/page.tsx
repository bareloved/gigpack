"use client";

import { MinimalLayout } from "@/components/gigpack/layouts/minimal-layout";
import { GigPack } from "@/lib/types";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

// Sample gig pack data for testing
const sampleGigPackWithHero: Omit<GigPack, "internal_notes" | "owner_id"> = {
  id: "test-gig",
  public_slug: "test-gig",
  title: "Sarah & John's Wedding",
  band_name: "The Test Band",
  date: "2024-12-25",
  call_time: "6:00 PM",
  on_stage_time: "7:30 PM",
  venue_name: "The Main Stage",
  venue_address: "123 Music Street, Downtown",
  band_id: null,
  setlist_structured: null,
  is_archived: false,
  venue_maps_url: "https://maps.google.com",
  gig_type: "wedding",
  accent_color: "#ef4444",
  poster_skin: "clean",
  band_logo_url: "/gigpack-logo-dark.png",
  hero_image_url: "/gig-fallbacks/concert-crowd.jpeg",
  setlist: `Don't Stop Believin' – Journey
Livin' on a Prayer – Bon Jovi
Hotel California – Eagles

Stairway to Heaven – Led Zeppelin
Bohemian Rhapsody – Queen
Dream On – Aerosmith

Free Bird – Lynyrd Skynyrd
More Than a Feeling – Boston
American Pie – Don McLean

Piano Man – Billy Joel
Imagine – John Lennon`,
  lineup: [
    { role: "Lead Vocals", name: "John Smith", notes: " harmonies" },
    { role: "Guitar", name: "Jane Doe", notes: "lead guitar" },
    { role: "Bass", name: "Mike Johnson" },
    { role: "Drums", name: "Sarah Wilson" },
    { role: "Keys", notes: "backup vocals" },
  ],
  materials: [
    {
      id: "1",
      label: "Setlist Charts",
      url: "https://docs.google.com/document/d/example",
      kind: "charts" as const,
    },
    {
      id: "2",
      label: "Stage Plot",
      url: "https://example.com/stage-plot.pdf",
      kind: "performance" as const,
    },
    {
      id: "3",
      label: "Rehearsal Recording",
      url: "https://drive.google.com/file/d/example",
      kind: "rehearsal" as const,
    },
  ],
  schedule: [
    {
      id: "1",
      time: "5:00 PM",
      label: "Load-in & Setup",
    },
    {
      id: "2",
      time: "6:00 PM",
      label: "Soundcheck",
    },
    {
      id: "3",
      time: "7:30 PM",
      label: "Doors Open",
    },
    {
      id: "4",
      time: "8:15 PM",
      label: "Show Start",
    },
  ],
  dress_code: "Smart casual - no jeans, no sneakers",
  backline_notes: "Full backline provided. Bring your own pedals and cables.",
  parking_notes: "Free parking in the back lot. Arrive early for best spots.",
  payment_notes: "Cash payment at the end of the night.",
  packing_checklist: [
    { id: "1", label: "Guitar" },
    { id: "2", label: "Pedals" },
    { id: "3", label: "Cables" },
    { id: "4", label: "Water bottle" },
    { id: "5", label: "Setlist" },
  ],
  created_at: "2024-12-01T00:00:00Z",
  updated_at: "2024-12-01T00:00:00Z",
  theme: "minimal",
};

// Sample gig pack data without hero image (tests accent banner)
const sampleGigPackNoHero: Omit<GigPack, "internal_notes" | "owner_id"> = {
  ...sampleGigPackWithHero,
  hero_image_url: null,
  band_logo_url: null,
};

export default function GigPackLayoutTestPage() {
  const params = useParams();
  const locale = params.locale as string || "en";
  const [showWithHero, setShowWithHero] = useState(true);

  const sampleGigPack = showWithHero ? sampleGigPackWithHero : sampleGigPackNoHero;

  const handleOpenMaps = () => {
    if (sampleGigPack.venue_maps_url) {
      window.open(sampleGigPack.venue_maps_url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">GigPack Layout Test</h1>
          <p className="text-muted-foreground mb-4">
            Testing the unified minimal layout in {locale === 'he' ? 'Hebrew (RTL)' : 'English (LTR)'}
          </p>
          <Button
            onClick={() => setShowWithHero(!showWithHero)}
            variant="outline"
            className="mb-4"
          >
            Switch to {showWithHero ? 'No Hero Image' : 'With Hero Image'}
          </Button>
        </div>

        <MinimalLayout
          gigPack={sampleGigPack}
          openMaps={handleOpenMaps}
          slug={sampleGigPack.public_slug}
          locale={locale}
        />
      </div>
    </div>
  );
}
