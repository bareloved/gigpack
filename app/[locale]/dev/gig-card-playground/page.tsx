"use client";

import { useState } from "react";
import { GigCardVariant, type MockGig, type VariantType } from "@/components/dev/gig-card-variant";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// =============================================================================
// MOCK DATA
// =============================================================================

const MOCK_GIGS: Record<string, MockGig> = {
  A: {
    id: "mock-1",
    title: "Summer Wedding at The Manor",
    band_name: "Felix & Co",
    date: "2025-07-15",
    call_time: "17:00",
    venue_name: "The Manor Estate, Berkshire",
  },
  B: {
    id: "mock-2",
    title: "Jazz Brunch Service",
    band_name: "The Ritalin Quartet",
    date: "2025-06-22",
    call_time: "10:30",
    venue_name: "The Ivy Chelsea Garden",
  },
  C: {
    id: "mock-3",
    title: "Friday Night Residency",
    band_name: "Midnight Groove",
    date: "2025-06-13",
    call_time: "21:00",
    venue_name: "Ronnie Scott's Jazz Club",
  },
};

// =============================================================================
// VARIANT METADATA
// =============================================================================

const VARIANTS: Array<{ key: VariantType; label: string; description: string }> = [
  {
    key: "current",
    label: "Current (Production)",
    description: "Vibrant gradient with subtle dark overlay",
  },
  {
    key: "soft-strip",
    label: "Soft Neutral Strip",
    description: "Thin mood-based color strip with neutral header",
  },
  {
    key: "minimal",
    label: "Minimal Initials Focus",
    description: "Clean design with accent circle and large initials",
  },
  {
    key: "mono",
    label: "Monochrome",
    description: "Single soft background color, no gradient",
  },
  {
    key: "paper",
    label: "Paper Texture",
    description: "Subtle paper texture with cream background",
  },
  {
    key: "grain",
    label: "Grainy Gradient",
    description: "Soft gradient with printed/analog grain effect",
  },
  {
    key: "blocks",
    label: "Diagonal Blocks",
    description: "Two-tone diagonal split design",
  },
  {
    key: "frame",
    label: "Framed Card",
    description: "Photo frame style with inner border",
  },
];

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function GigCardPlayground() {
  const [selectedGig, setSelectedGig] = useState<keyof typeof MOCK_GIGS>("A");

  const currentGig = MOCK_GIGS[selectedGig];

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Gig Card Playground</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Visual comparison of 8 different fallback card designs for gigs without band images.
          Each variant maintains the same information layout with different visual treatments.
        </p>

        {/* Mock Gig Selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Select Mock Gig:</span>
          <div className="inline-flex items-center gap-1 rounded-lg bg-muted/50 p-1 border border-border/50">
            {(Object.keys(MOCK_GIGS) as Array<keyof typeof MOCK_GIGS>).map((key) => (
              <Button
                key={key}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedGig(key)}
                className={
                  selectedGig === key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                Mock Gig {key}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Gig Info Card */}
        <Card className="mt-6 bg-muted/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold text-muted-foreground">Title:</span>{" "}
                <span className="text-foreground">{currentGig.title}</span>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Band:</span>{" "}
                <span className="text-foreground">{currentGig.band_name}</span>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Venue:</span>{" "}
                <span className="text-foreground">{currentGig.venue_name}</span>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Date:</span>{" "}
                <span className="text-foreground">{currentGig.date}</span>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Call Time:</span>{" "}
                <span className="text-foreground">{currentGig.call_time}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Variants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {VARIANTS.map((variant) => (
          <div key={variant.key} className="space-y-3">
            {/* Variant Label */}
            <div className="space-y-1">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-primary">
                Variant {variant.key.charAt(0).toUpperCase()} – {variant.label}
              </h3>
              <p className="text-xs text-muted-foreground">{variant.description}</p>
            </div>

            {/* Card */}
            <GigCardVariant variant={variant.key} gig={currentGig} />
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-12 p-6 rounded-lg bg-muted/50 border border-border">
        <h3 className="font-semibold mb-2">Implementation Notes</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>All variants use the same information layout and shadcn components</li>
          <li>Textures (paper, grain) use lightweight inline SVG data URIs</li>
          <li>All designs support dark mode with appropriate color variants</li>
          <li>No database queries or API calls – purely visual comparison</li>
        </ul>
      </div>
    </div>
  );
}

