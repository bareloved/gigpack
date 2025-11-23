"use client";

import { useEffect, useState } from "react";
import { GigPack, GigPackTheme } from "@/lib/types";
import { RefreshCw } from "lucide-react";
import { MinimalLayout } from "@/components/gigpack/layouts/minimal-layout";
import { VintagePosterLayout } from "@/components/gigpack/layouts/vintage-poster-layout";
import { SocialCardLayout } from "@/components/gigpack/layouts/social-card-layout";
import { ThemeToggle } from "@/components/theme-toggle";

interface PublicGigPackViewProps {
  initialGigPack: Omit<GigPack, "internal_notes" | "owner_id">;
  slug: string;
}

export function PublicGigPackView({ initialGigPack, slug }: PublicGigPackViewProps) {
  const [gigPack, setGigPack] = useState(initialGigPack);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isChecking, setIsChecking] = useState(false);

  // Determine theme: default to 'minimal' if not set
  const theme: GigPackTheme = (gigPack.theme || "minimal") as GigPackTheme;

  // Fast polling mechanism for near real-time updates (5 seconds)
  // Only polls when tab is active to save resources
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const poll = async () => {
      // Don't poll if document is hidden
      if (document.hidden) return;
      
      setIsChecking(true);
      try {
        const res = await fetch(`/api/gigpack/${slug}`);
        if (res.ok) {
          const data = await res.json();
          // Compare using updated_at timestamp for efficiency
          if (data.updated_at !== gigPack.updated_at) {
            setGigPack(data);
            setLastUpdated(new Date());
          }
        }
      } catch (error) {
        console.error("Error polling gig pack:", error);
      } finally {
        setIsChecking(false);
      }
    };

    // Poll every 5 seconds for near-instant updates
    interval = setInterval(poll, 5000);

    // Pause polling when tab is not visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        // Resume polling and check immediately
        poll();
        interval = setInterval(poll, 5000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [slug, gigPack.updated_at]);

  const openMaps = () => {
    if (gigPack.venue_maps_url) {
      window.open(gigPack.venue_maps_url, "_blank");
    }
  };

  // Render theme-based layout
  // Theme mapping: theme string → component
  // To add a new theme:
  // 1. Add the theme value to GigPackTheme type in lib/types.ts
  // 2. Create a new layout component in components/gigpack/layouts/
  // 3. Add a case here to render it
  const renderThemeLayout = () => {
    switch (theme) {
      case "vintage_poster":
        return <VintagePosterLayout gigPack={gigPack} openMaps={openMaps} />;
      case "social_card":
        return <SocialCardLayout gigPack={gigPack} openMaps={openMaps} />;
      case "minimal":
      default:
        return <MinimalLayout gigPack={gigPack} openMaps={openMaps} />;
    }
  };

  return (
    <>
      {renderThemeLayout()}
      
      {/* Dark mode toggle - top right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Footer with auto-update indicator - shown on all themes */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-card border rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin text-primary' : ''}`} />
          <span className="hidden sm:inline">
            Updated {lastUpdated.toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              hour: 'numeric', 
              minute: '2-digit' 
            })}
          </span>
          <span className="sm:hidden">Live</span>
        </div>
      </div>
    </>
  );
}

