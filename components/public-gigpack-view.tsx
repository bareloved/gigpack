"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { GigPack, GigPackTheme } from "@/lib/types";
import { RefreshCw, Eye } from "lucide-react";
import { MinimalLayout } from "@/components/gigpack/layouts/minimal-layout";
import { RehearsalView } from "@/components/gigpack/rehearsal-view";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { createClient } from "@/lib/supabase/client";

// Error Boundary Component for debugging
class PublicGigPackErrorBoundary extends React.Component<
  { children: React.ReactNode; slug: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; slug: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("[PublicGigPackErrorBoundary] Caught error:", error);
    console.error("[PublicGigPackErrorBoundary] Error stack:", error.stack);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[PublicGigPackErrorBoundary] Component stack:", errorInfo.componentStack);
    console.error("[PublicGigPackErrorBoundary] Error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      slug: this.props.slug
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
          <div className="max-w-md w-full bg-card border rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4 text-destructive">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              There was an error loading this gig pack.
            </p>
            <details className="text-left bg-muted p-3 rounded text-sm">
              <summary className="cursor-pointer font-medium">Error details (for debugging)</summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs">
                {this.state.error?.message}
                {this.state.error?.stack}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface PublicGigPackViewProps {
  initialGigPack: Omit<GigPack, "internal_notes" | "owner_id">;
  slug: string;
  locale?: string;
}

export function PublicGigPackView({ initialGigPack, slug, locale = "en" }: PublicGigPackViewProps) {

  const searchParams = useSearchParams();
  const t = useTranslations("publicView");
  const [gigPack, setGigPack] = useState(initialGigPack);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isChecking, setIsChecking] = useState(false);
  const [isUserActive, setIsUserActive] = useState(true);

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

  // Smart polling for live updates - only polls when actively viewed
  // Uses shorter intervals when page is visible and user is active
  useEffect(() => {
    let activityTimeout: NodeJS.Timeout;
    let interval: NodeJS.Timeout;
    
    const poll = async () => {
      // Don't poll if user is idle or page is hidden
      if (!isUserActive || document.hidden) return;
      
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

    const resetActivityTimeout = () => {
      setIsUserActive(true);
      clearTimeout(activityTimeout);
      // Mark user as idle after 30 seconds of no activity
      activityTimeout = setTimeout(() => {
        setIsUserActive(false);
      }, 30000);
    };

    // Start with active state
    resetActivityTimeout();

    // Set up activity listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      document.addEventListener(event, resetActivityTimeout, { passive: true });
    });

    // Poll immediately when becoming visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        resetActivityTimeout(); // Reset activity when page becomes visible
        poll(); // Check immediately
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Set polling interval based on activity state
    const pollInterval = isUserActive && !document.hidden ? 10000 : 60000;
    // eslint-disable-next-line prefer-const
    interval = setInterval(poll, pollInterval);

    return () => {
      clearInterval(interval);
      clearTimeout(activityTimeout);
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetActivityTimeout);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [slug, gigPack.updated_at, isUserActive]);

  const openMaps = () => {
    if (gigPack.venue_maps_url) {
      window.open(gigPack.venue_maps_url, "_blank");
    }
  };

  // Render unified minimal layout
  // All themes now render as minimal for simplified codebase
  const renderThemeLayout = () => {
    try {
        return <MinimalLayout gigPack={gigPack} openMaps={openMaps} slug={slug} locale={locale} />;
    } catch (error) {
      console.error("[PublicGigPackView] Error in renderThemeLayout:", error);
      throw error;
    }
  };

  return (
    <PublicGigPackErrorBoundary slug={slug}>
    <TooltipProvider>
      {/* Render either Rehearsal View or normal theme layout */}
      {isRehearsalMode ? (
          (() => {
            try {
              return <RehearsalView gigPack={gigPack} openMaps={openMaps} slug={slug} locale={locale} />;
            } catch (error) {
              console.error("[PublicGigPackView] Error in RehearsalView:", error);
              throw error;
            }
          })()
      ) : (
        renderThemeLayout()
      )}
      
      {/* Controls - Top right corner */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Rehearsal Mode toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-background/80 backdrop-blur-sm rounded-lg border border-border/50 shadow-lg">
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
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">{t("rehearsalMode")}</p>
            <p className="text-xs text-muted-foreground">{t("stageView")}</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Dark mode toggle */}
        <div className="bg-background/80 backdrop-blur-sm rounded-lg border border-border/50 shadow-lg">
        <ThemeToggle />
        </div>
      </div>
      
      {/* Footer with smart polling indicator - shown on all views */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-card border rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin text-primary' : isUserActive ? 'text-green-500' : 'text-orange-500'}`} />
          <span className="hidden sm:inline">
            {isUserActive ? t("statusActive") : t("statusIdle")} • {lastUpdated.toLocaleString(locale === 'he' ? 'he-IL' : 'en-US', {
              month: 'short', 
              day: 'numeric', 
              hour: 'numeric', 
              minute: '2-digit' 
            })}
          </span>
          <span className="sm:hidden">{isUserActive ? t("statusLive") : t("statusIdle")}</span>
        </div>
      </div>
    </TooltipProvider>
    </PublicGigPackErrorBoundary>
  );
}

