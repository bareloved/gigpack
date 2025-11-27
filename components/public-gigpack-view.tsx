"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { GigPack, GigPackTheme } from "@/lib/types";
import { RefreshCw, Eye } from "lucide-react";
import { MinimalLayout } from "@/components/gigpack/layouts/minimal-layout";
import { VintagePosterLayout } from "@/components/gigpack/layouts/vintage-poster-layout";
import { SocialCardLayout } from "@/components/gigpack/layouts/social-card-layout";
import { RehearsalView } from "@/components/gigpack/rehearsal-view";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PublicGigPackViewProps {
  initialGigPack: Omit<GigPack, "internal_notes" | "owner_id">;
  slug: string;
}

export function PublicGigPackView({ initialGigPack, slug }: PublicGigPackViewProps) {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const t = useTranslations("public");
  const [gigPack, setGigPack] = useState(initialGigPack);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isChecking, setIsChecking] = useState(false);

  // Rehearsal Mode state
  // Initialize from URL param or localStorage
  const [isRehearsalMode, setIsRehearsalMode] = useState(() => {
    // Check URL param first (e.g., ?view=stage or ?mode=rehearsal)
    const viewParam = searchParams.get("view");
    const modeParam = searchParams.get("mode");
    if (viewParam === "stage" || modeParam === "rehearsal") {
      return true;
    }

    // Fall back to localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`gigpack_rehearsal_mode_${slug}`);
      return stored === "true";
    }
    
    return false;
  });

  // Determine theme: default to 'minimal' if not set
  const theme: GigPackTheme = (gigPack.theme || "minimal") as GigPackTheme;

  // Persist rehearsal mode preference to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`gigpack_rehearsal_mode_${slug}`, String(isRehearsalMode));
    }
  }, [isRehearsalMode, slug]);

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
        return <VintagePosterLayout gigPack={gigPack} openMaps={openMaps} slug={slug} />;
      case "social_card":
        return <SocialCardLayout gigPack={gigPack} openMaps={openMaps} slug={slug} />;
      case "minimal":
      default:
        return <MinimalLayout gigPack={gigPack} openMaps={openMaps} slug={slug} />;
    }
  };

  return (
    <TooltipProvider>
      {/* Render either Rehearsal View or normal theme layout */}
      {isRehearsalMode ? (
        <RehearsalView gigPack={gigPack} openMaps={openMaps} slug={slug} />
      ) : (
        renderThemeLayout()
      )}
      
      {/* Controls - Top right corner */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Rehearsal Mode toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsRehearsalMode(!isRehearsalMode)}
              className="transition-transform hover:scale-110"
            >
              <Eye 
                className={`h-5 w-5 transition-all ${
                  isRehearsalMode 
                    ? 'text-primary fill-primary' 
                    : 'text-muted-foreground'
                }`} 
              />
              <span className="sr-only">{t("rehearsalMode")}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">{t("rehearsalMode")}</p>
            <p className="text-xs text-muted-foreground">{t("stageOptimizedView")}</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Dark mode toggle */}
        <ThemeToggle />
      </div>
      
      {/* Footer with auto-update indicator - shown on all views */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-card border rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin text-primary' : ''}`} />
          <span className="hidden sm:inline">
            {lastUpdated.toLocaleString(locale === 'he' ? 'he-IL' : 'en-US', { 
              month: 'short', 
              day: 'numeric', 
              hour: 'numeric', 
              minute: '2-digit' 
            })}
          </span>
          <span className="sm:hidden">Live</span>
        </div>
      </div>
    </TooltipProvider>
  );
}

