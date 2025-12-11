"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  PaperTextureHeader,
  getPaperFallbackColors,
} from "@/components/gigpacks/paper-texture-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  MapPin,
  Edit,
  Clock,
  Trash2,
  Share2,
  Plus,
  Loader2,
  Zap,
  LayoutGrid,
  List as ListIcon,
  LayoutTemplate,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HandDrawnSquiggle, HandDrawnStar } from "@/components/hand-drawn/accents";
import { GigEditorPanel } from "@/components/gig-editor-panel";
import type { GigPack, UserTemplate, Band } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { getUserTemplates } from "@/lib/userTemplates";
import { cn } from "@/lib/utils";
import { classifyGigVisualTheme, pickFallbackImageForTheme } from "@/lib/gig-visual-theme";
import { Skeleton } from "@/components/ui/skeleton";

// =============================================================================
// TYPES
// =============================================================================

export type GigPackListItem = {
  id: string;
  title: string;
  band_name: string | null;
  date: string | null;
  call_time: string | null;
  venue_name: string | null;
  public_slug: string;
  updated_at: string;
  created_at: string;
  gig_mood: string | null;
  gig_type: string | null;
  hero_image_url: string | null;
  band_logo_url: string | null;
  band_id: string | null;
};

export type GigPackSheetState =
  | { mode: "create" }
  | { mode: "edit"; gigPackId: string };

interface GigPacksClientPageProps {
  initialGigPacks: GigPackListItem[];
  initialSheetState?: GigPackSheetState | null;
  initialEditingGigPack?: GigPack | null;
}

type ViewMode = "board" | "list" | "compact";
type ViewFilter = "all" | "upcoming" | "past";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const today = new Date();
today.setHours(0, 0, 0, 0);

const parseDate = (dateStr: string | null): Date | null => {
  if (!dateStr) return null;
  return new Date(dateStr);
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "TBD";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const isToday = (dateStr: string | null): boolean => {
  const date = parseDate(dateStr);
  if (!date) return false;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime() === today.getTime();
};

const isThisWeek = (dateStr: string | null): boolean => {
  const date = parseDate(dateStr);
  if (!date) return false;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return d >= today && d < weekEnd;
};

const isThisMonth = (dateStr: string | null): boolean => {
  const date = parseDate(dateStr);
  if (!date) return false;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const monthEnd = new Date(today);
  monthEnd.setDate(monthEnd.getDate() + 30);
  return d >= today && d < monthEnd;
};

const isPast = (dateStr: string | null): boolean => {
  const date = parseDate(dateStr);
  if (!date) return false;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < today;
};

type GigGroup = {
  label: string;
  gigs: GigPackListItem[];
};

const sortPastGigs = (gigs: GigPackListItem[]): GigPackListItem[] => {
  return gigs.filter((g) => isPast(g.date)).sort((a, b) => {
    const dateA = parseDate(a.date)?.getTime() || 0;
    const dateB = parseDate(b.date)?.getTime() || 0;
    return dateB - dateA;
  });
};

const sortUpcomingGigs = (gigs: GigPackListItem[]): GigPackListItem[] => {
  return gigs.filter((g) => !isPast(g.date)).sort((a, b) => {
    const dateA = parseDate(a.date)?.getTime() || 0;
    const dateB = parseDate(b.date)?.getTime() || 0;
    // Sort TBD dates to the end
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateA - dateB;
  });
};

const groupGigsByTime = (gigs: GigPackListItem[], filter: ViewFilter): GigGroup[] => {
  if (filter === "past") {
    const pastGigs = sortPastGigs(gigs);
    if (pastGigs.length === 0) return [];
    return [{ label: "Past Gigs", gigs: pastGigs }];
  }

  const upcomingGigs = sortUpcomingGigs(gigs);
  const thisWeek = upcomingGigs.filter((g) => isThisWeek(g.date));
  const laterThisMonth = upcomingGigs.filter((g) => !isThisWeek(g.date) && isThisMonth(g.date));
  const otherUpcoming = upcomingGigs.filter((g) => !isThisMonth(g.date));

  const groups: GigGroup[] = [];
  if (thisWeek.length > 0) groups.push({ label: "This Week", gigs: thisWeek });
  if (laterThisMonth.length > 0) groups.push({ label: "Later This Month", gigs: laterThisMonth });
  if (otherUpcoming.length > 0) groups.push({ label: "Other Upcoming", gigs: otherUpcoming });

  if (filter === "all") {
    const pastGigs = sortPastGigs(gigs);
    if (pastGigs.length > 0) groups.push({ label: "Past", gigs: pastGigs });
  }
  
  // Handle unscheduled gigs
  const groupedIds = new Set(groups.flatMap(g => g.gigs.map(gig => gig.id)));
  const leftovers = upcomingGigs.filter(g => !groupedIds.has(g.id));
  
  if (leftovers.length > 0) {
    groups.push({ label: "Upcoming (Unscheduled)", gigs: leftovers });
  }

  return groups;
};

// =============================================================================
// COMPONENT PARTS
// =============================================================================

/**
 * Component to display band image with fallback
 * - Board view (card): prefers hero_image_url (wide/promotional images)
 * - List/Compact views (thumbnail/compact): prefers band_logo_url (square logos)
 *
 * Priority for card images:
 * 1. Gig's hero_image_url (explicit hero image)
 * 2. Band's hero_image_url (if band_id exists)
 * 3. Themed fallback from visual theme classifier
 * 4. Paper texture with initials (final fallback)
 */
// Global cache for band data to avoid duplicate fetches
const bandCache = new Map<string, Band>();

const GigBandImage = ({
  gig,
  variant = "card",
}: {
  gig: GigPackListItem;
  variant?: "card" | "thumbnail" | "compact";
}) => {
  const [bandData, setBandData] = useState<Band | null>(() => {
    // Check cache first
    if (gig.band_id && bandCache.has(gig.band_id)) {
      return bandCache.get(gig.band_id)!;
    }
    return null;
  });
  const [isLoadingBand, setIsLoadingBand] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  // Fetch band data if we have band_id and need it for card view
  useEffect(() => {
    if (variant === "card" && gig.band_id && !gig.hero_image_url && !bandData && !isLoadingBand) {
      // Double-check cache
      if (bandCache.has(gig.band_id)) {
        setBandData(bandCache.get(gig.band_id)!);
        return;
      }

      setIsLoadingBand(true);
      const fetchBand = async () => {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("bands")
            .select("*")
            .eq("id", gig.band_id)
            .single();
          
          if (!error && data) {
            const band = data as Band;
            // Cache the result
            bandCache.set(gig.band_id!, band);
            setBandData(band);
          }
        } catch (err) {
          console.error("Band fetch error:", err);
        } finally {
          setIsLoadingBand(false);
        }
      };
      fetchBand();
    }
  }, [variant, gig.band_id, gig.hero_image_url, bandData, isLoadingBand]);

  // Determine the background image source with priority fallback chain
  let imageUrl: string | null = null;
  
  // #region agent log - theme classification
  try {
    // Priority 1: Gig's explicit hero image
    if (gig.hero_image_url) {
      imageUrl = gig.hero_image_url;
    }
    // Priority 2: Band's hero image (for card variant only)
    else if (variant === "card" && bandData?.hero_image_url) {
      imageUrl = bandData.hero_image_url;
    }
    // Priority 3: Themed fallback image (for card variant only)
    else if (variant === "card") {
      const theme = classifyGigVisualTheme({
        gig: {
          id: gig.id,
          title: gig.title,
          band_name: gig.band_name,
          venue_name: gig.venue_name,
          gig_type: gig.gig_type,
          gig_mood: null,
        } as GigPack,
        band: bandData || undefined,
      });
      imageUrl = pickFallbackImageForTheme(theme);
    }
    // Priority 4: Band logo for list/compact views
    else if (gig.band_logo_url) {
      imageUrl = gig.band_logo_url;
    }
  } catch (err) {
    console.error("Error in GigBandImage theme/image logic:", err);
  }
  
  // Generate a consistent gradient based on band name (for fallback)
  const getBandGradient = (bandName: string | null) => {
    if (!bandName) return "from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800";
    const colors = [
      "from-blue-400 to-indigo-500",
      "from-purple-400 to-pink-500",
      "from-green-400 to-teal-500",
      "from-orange-400 to-red-500",
      "from-cyan-400 to-blue-500",
      "from-fuchsia-400 to-purple-500",
    ];
    const hash = bandName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const gradient = getBandGradient(gig.band_name);

  // Dimensions based on variant
  const dimensions = {
    card: { width: 400, height: 240, className: "h-60 w-full" },
    thumbnail: { width: 80, height: 80, className: "h-16 w-16" },
    compact: { width: 48, height: 48, className: "h-10 w-10" },
  }[variant];

  // Show loading skeleton while fetching band data
  if (isLoadingBand) {
    return (
      <Skeleton className={cn(dimensions.className, variant === "card" ? "rounded-t-lg" : "rounded-md")} />
    );
  }

  if (imageUrl && !imageLoadFailed) {
    // Check if this is a fallback image (static asset in public/) or external image
    const isFallbackImage = imageUrl.startsWith('/gig-fallbacks/');
    
    // Convert to absolute URL to bypass locale-based routing
    const absoluteImageUrl = isFallbackImage && typeof window !== 'undefined'
      ? `${window.location.origin}${imageUrl}`
      : imageUrl;
    
    return (
      <div className={cn("relative overflow-hidden bg-muted", dimensions.className, variant === "card" ? "rounded-t-lg" : "rounded-md")}>
        {/* Use plain img for static fallback images, Image component for optimized external images */}
        {isFallbackImage ? (
          <img
            src={absoluteImageUrl}
            alt={gig.band_name || gig.title}
            className={cn(
              "w-full h-full object-cover",
              variant === "card" && "opacity-75"
            )}
            onError={() => {
              setImageLoadFailed(true);
            }}
          />
        ) : (
          <Image
            src={imageUrl}
            alt={gig.band_name || gig.title}
            fill
            sizes={variant === "card" ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : "80px"}
            className={cn(
              "object-cover",
              variant === "card" && "opacity-75"
            )}
            loading="lazy"
            quality={60}
            onError={() => {
              setImageLoadFailed(true);
            }}
          />
        )}
        {/* Gradient overlay for text readability - Spotify style */}
        {variant === "card" && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/80" />
        )}
      </div>
    );
  }

  // Fallback: paper texture with gentle color variations for all variants
  const initials = gig.band_name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  const paperColors = getPaperFallbackColors({
    id: gig.id,
    gig_mood: gig.gig_mood,
    title: gig.title,
  });

  // Board view (card): Use paper texture with gradient
  if (variant === "card") {
    return <PaperTextureHeader initials={initials} colors={paperColors} showGradient={true} />;
  }

  // List/Compact views: Use paper texture WITHOUT gradient
  return (
    <PaperTextureHeader 
      initials={initials} 
      colors={paperColors} 
      size={variant} 
      showGradient={false}
    />
  );
};

const VibeTag = ({ vibe, iconOnly = false }: { vibe: string | null; iconOnly?: boolean }) => {
  if (!vibe) return null;

  const vibeColors: Record<string, string> = {
    "High energy": "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
    Acoustic: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    Jazz: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    Party: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-400 dark:border-fuchsia-800",
    Lounge: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800",
    "Club night": "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800",
    Retro: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
    Outdoor: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  };

  const colorClass = vibeColors[vibe] || "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800";

  if (iconOnly) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        colorClass
      )}
    >
      {vibe}
    </span>
  );
};

const LayoutSwitcher = ({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}) => {
  return (
    <div className="inline-flex items-center p-1 bg-muted/50 rounded-lg border border-border/50">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("board")}
        className={cn(
          "h-8 px-3 text-muted-foreground hover:text-foreground",
          value === "board" && "bg-background text-foreground shadow-sm"
        )}
      >
        <LayoutGrid className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Board</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("list")}
        className={cn(
          "h-8 px-3 text-muted-foreground hover:text-foreground",
          value === "list" && "bg-background text-foreground shadow-sm"
        )}
      >
        <ListIcon className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">List</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("compact")}
        className={cn(
          "h-8 px-3 text-muted-foreground hover:text-foreground",
          value === "compact" && "bg-background text-foreground shadow-sm"
        )}
      >
        <LayoutTemplate className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Compact</span>
      </Button>
    </div>
  );
};

const ViewFilterPills = ({
  value,
  onChange,
}: {
  value: ViewFilter;
  onChange: (filter: ViewFilter) => void;
}) => {
  const filters: { key: ViewFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
  ];

  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-muted/50 p-1 border border-border/50">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onChange(filter.key)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
            value === filter.key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

const NextUpStrip = ({ gigs }: { gigs: GigPackListItem[] }) => {
  // Find the next upcoming gig
  const upcomingGigs = gigs
    .filter((g) => !isPast(g.date))
    .sort((a, b) => {
        const dateA = parseDate(a.date)?.getTime() || 0;
        const dateB = parseDate(b.date)?.getTime() || 0;
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA - dateB;
    });

  if (upcomingGigs.length === 0) return null;

  const nextGig = upcomingGigs[0];
  const isTodayGig = isToday(nextGig.date);

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-xl px-4 py-3 border",
      isTodayGig
        ? "bg-orange-600/10 border-orange-600/30 dark:bg-orange-500/10 dark:border-orange-500/30"
        : "bg-accent/10 border-accent/30"
    )}>
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full",
        isTodayGig ? "bg-orange-600/20 dark:bg-orange-500/20" : "bg-accent/20"
      )}>
        {isTodayGig ? (
          <Zap className={cn("h-4 w-4", isTodayGig ? "text-orange-700 dark:text-orange-300" : "text-slate-700 dark:text-slate-300")} />
        ) : (
          <Calendar className="h-4 w-4 text-slate-700 dark:text-slate-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className={cn(
          "text-xs font-bold uppercase tracking-wider",
          isTodayGig ? "text-orange-700 dark:text-orange-300" : "text-slate-700 dark:text-slate-300"
        )}>
          {isTodayGig ? "Today" : "Next up"}
        </span>
        <p className="text-sm font-medium truncate text-slate-800 dark:text-slate-200">
          {nextGig.title}
          {nextGig.call_time && ` – Call ${nextGig.call_time}`}
          {nextGig.venue_name && ` at ${nextGig.venue_name}`}
        </p>
      </div>
    </div>
  );
};

const SectionHeader = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <h2 className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
      {label}
    </h2>
    <div className="flex-1 h-px bg-border/50" />
  </div>
);

const EmptyState = ({ viewFilter, onCreate }: { viewFilter: ViewFilter, onCreate?: () => void }) => (
  <Card className="border-2 border-dashed bg-card/50">
    <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="rounded-full bg-muted p-4">
        <Calendar className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-muted-foreground">
            {viewFilter === "past"
            ? "No past gigs found."
            : "No upcoming gigs."}
        </p>
        {viewFilter !== "past" && onCreate && (
            <Button onClick={onCreate} variant="outline" className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Pack your first gig
            </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

// =============================================================================
// VIEW COMPONENTS
// =============================================================================

interface ViewProps {
  groups: GigGroup[];
  onEdit: (id: string) => void;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
  viewFilter: ViewFilter;
  onCreate?: () => void;
}

const BoardView = ({ groups, onEdit, onShare, onDelete, onClick, viewFilter, onCreate }: ViewProps) => {
  if (groups.length === 0) return <EmptyState viewFilter={viewFilter} onCreate={onCreate} />;

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.label}>
          <SectionHeader label={group.label} />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {group.gigs.map((gig) => {
                const isTodayGig = isToday(gig.date);
                const isPastGig = isPast(gig.date);
                return (
                    <Card
                      key={gig.id}
                      className={cn(
                        "group relative overflow-hidden border-2 transition-all duration-200 cursor-pointer",
                        "hover:shadow-xl hover:scale-[1.02] hover:border-primary/40",
                        isPastGig && "opacity-75"
                      )}
                      onClick={() => onClick(gig.id)}
                    >
                      {/* Today indicator stripe */}
                      {isTodayGig && (
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary/80 to-primary z-10" />
                      )}

                      {/* Hero Image with overlaid title - Spotify style */}
                      <div className="relative">
                        <GigBandImage gig={gig} variant="card" />
                        
                        {/* Title & Band overlaid on image */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                          <h3 className="text-2xl font-bold leading-tight line-clamp-2 text-white drop-shadow-lg mb-2 group-hover:text-primary/90 transition-colors">
                            {gig.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg text-white/90 font-medium drop-shadow">{gig.band_name || "TBD"}</span>
                            <VibeTag vibe={gig.gig_mood} />
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-5 space-y-3">
                        {/* Date & Call Time pills */}
                        <div className="flex flex-wrap gap-2">
                          <div className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold border-2",
                            isTodayGig
                              ? "bg-orange-600/20 text-orange-600 border-orange-600/40 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/40"
                              : "bg-orange-600/15 text-orange-600 border-orange-600/30 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30"
                          )}>
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{isTodayGig ? "Today" : formatDate(gig.date)}</span>
                          </div>

                          {gig.call_time && (
                              <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1.5 text-sm font-medium text-muted-foreground border border-border/50">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Call: {gig.call_time}</span>
                              </div>
                          )}
                        </div>

                        {/* Venue line */}
                        {gig.venue_name && (
                            <div className="flex items-center gap-2 pt-2 border-t border-dashed border-border">
                              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm font-medium text-muted-foreground line-clamp-1">
                                {gig.venue_name}
                              </span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 font-semibold"
                            onClick={() => onEdit(gig.id)}
                          >
                            <Edit className="mr-1.5 h-3.5 w-3.5" />
                            Edit
                          </Button>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 font-semibold"
                                  onClick={() => onShare(gig.id)}
                                >
                                  <Share2 className="mr-1.5 h-3.5 w-3.5" />
                                  Share
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy shareable gig link for your band</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(gig.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

const ListView = ({ groups, onEdit, onShare, onDelete, onClick, viewFilter, onCreate }: ViewProps) => {
  if (groups.length === 0) return <EmptyState viewFilter={viewFilter} onCreate={onCreate} />;

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.label}>
          <SectionHeader label={group.label} />
          <div className="flex flex-col gap-2">
            {group.gigs.map((gig) => {
              const isTodayGig = isToday(gig.date);
              
              return (
                <div
                  key={gig.id}
                  className={cn(
                    "group flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer relative",
                    isTodayGig && "border-orange-600/30 bg-orange-600/5 dark:border-orange-500/30 dark:bg-orange-500/5"
                  )}
                  onClick={() => onClick(gig.id)}
                >
                  {/* Band Thumbnail */}
                  <div className="shrink-0">
                    <GigBandImage gig={gig} variant="thumbnail" />
                  </div>

                  {/* Status & Date Column */}
                  <div className="flex items-center gap-3 md:w-48 shrink-0">
                    <div className="flex flex-col">
                      <span className={cn("font-bold text-lg leading-none", isTodayGig && "text-orange-600 dark:text-orange-400")}>
                        {formatDate(gig.date)}
                      </span>
                      <span className="text-sm text-muted-foreground">{gig.call_time || "TBD"}</span>
                    </div>
                  </div>

                  {/* Main Info Column */}
                  <div className="flex-1 min-w-0 grid gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base truncate">{gig.title}</span>
                      <VibeTag vibe={gig.gig_mood} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground/80">{gig.band_name || "No band name"}</span>
                      <span>•</span>
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{gig.venue_name || "TBD Venue"}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 md:ml-4 pt-2 md:pt-0 border-t md:border-t-0 border-dashed border-border w-full md:w-auto justify-end" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(gig.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onShare(gig.id)}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

const CompactView = ({ groups, onEdit, onShare, onDelete, onClick, viewFilter, onCreate }: ViewProps) => {
  if (groups.length === 0) return <EmptyState viewFilter={viewFilter} onCreate={onCreate} />;

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.label}>
          <SectionHeader label={group.label} />
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {group.gigs.map((gig) => {
               const isTodayGig = isToday(gig.date);
               
               return (
                <Card 
                  key={gig.id}
                  className={cn(
                    "hover:bg-accent/5 hover:border-primary/30 cursor-pointer transition-all",
                    isTodayGig && "border-orange-600/30 bg-orange-600/5 dark:border-orange-500/30 dark:bg-orange-500/5"
                  )}
                  onClick={() => onClick(gig.id)}
                >
                  <CardContent className="p-3 space-y-2">
                    {/* Header with Image */}
                    <div className="flex items-start gap-2">
                      <GigBandImage gig={gig} variant="compact" />
                      <span className="font-semibold truncate leading-tight flex-1">{gig.title}</span>
                    </div>

                    {/* Time & Location */}
                    <div className="text-sm space-y-0.5 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span className={cn(isTodayGig && "text-orange-600 dark:text-orange-400 font-medium")}>
                           {formatDate(gig.date)} {gig.call_time && `• ${gig.call_time}`}
                        </span>
                      </div>
                      {gig.venue_name && (
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{gig.venue_name}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                      <div className="text-xs text-muted-foreground/70 truncate max-w-[60%]">
                        {gig.band_name || "TBD"}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(gig.id)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onShare(gig.id)}>
                            <Share2 className="mr-2 h-4 w-4" /> Share
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(gig.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
               );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

// =============================================================================
// LOADING COMPONENTS
// =============================================================================

const GigPackCardSkeleton = () => (
  <Card className="overflow-hidden border-2">
    <Skeleton className="h-60 w-full" />
    <CardContent className="p-5 space-y-3">
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center gap-2 pt-2 border-t border-dashed border-border">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-9" />
      </div>
    </CardContent>
  </Card>
);

const GigPackListSkeleton = () => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4 rounded-lg border bg-card">
        <Skeleton className="h-16 w-16 rounded-md flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    ))}
  </div>
);

const GigPackCompactSkeleton = () => (
  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <Card key={i} className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
          <Skeleton className="h-5 w-full" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3.5 w-3.5 rounded" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3.5 w-3.5 rounded" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      </Card>
    ))}
  </div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const sortGigPacks = (packs: GigPackListItem[]) => {
  return [...packs].sort((a, b) => {
    if (a.date && b.date && a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};

const toListItem = (pack: GigPack): GigPackListItem => ({
  id: pack.id,
  title: pack.title,
  band_name: pack.band_name,
  date: pack.date,
  call_time: pack.call_time,
  venue_name: pack.venue_name,
  public_slug: pack.public_slug,
  updated_at: pack.updated_at,
  created_at: pack.created_at,
  gig_mood: pack.gig_mood,
  gig_type: pack.gig_type,
  hero_image_url: pack.hero_image_url,
  band_logo_url: pack.band_logo_url,
  band_id: pack.band_id,
});

export function GigPacksClientPage({
  initialGigPacks,
  initialSheetState = null,
  initialEditingGigPack = null,
}: GigPacksClientPageProps) {
  const { toast } = useToast();
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Show brief loading state on initial mount for user feedback
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 150);
    return () => clearTimeout(timer);
  }, []);
  
  // Layout State
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [viewFilter, setViewFilter] = useState<ViewFilter>("upcoming");

  const [gigPacks, setGigPacks] = useState<GigPackListItem[]>(() =>
    sortGigPacks(initialGigPacks),
  );
  
  
  // Get search query from URL
  const searchQuery = searchParams.get("search") || "";
  
  // Filter gigs based on search query
  const filteredGigPacks = useMemo(() => {
    if (!searchQuery.trim()) return gigPacks;
    
    const query = searchQuery.toLowerCase();
    return gigPacks.filter((gig) => {
      return (
        gig.title?.toLowerCase().includes(query) ||
        gig.band_name?.toLowerCase().includes(query) ||
        gig.venue_name?.toLowerCase().includes(query)
      );
    });
  }, [gigPacks, searchQuery]);
  
  // Computed grouped gigs (use filtered gigs)
  const groupedGigs = useMemo(() => {
    return groupGigsByTime(filteredGigPacks, viewFilter);
  }, [filteredGigPacks, viewFilter]);

  const [activePanel, setActivePanel] = useState<GigPackSheetState | null>(
    initialSheetState,
  );
  const [editingGigPack, setEditingGigPack] = useState<GigPack | null>(
    initialEditingGigPack,
  );
  const [isPanelLoading, setIsPanelLoading] = useState(
    initialSheetState?.mode === "edit" && !initialEditingGigPack,
  );
  
  // User templates state
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);
  const [isLoadingUserTemplates, setIsLoadingUserTemplates] = useState(false);


  // Load user templates
  const loadUserTemplates = useCallback(async () => {
    setIsLoadingUserTemplates(true);
    try {
      const { data, error } = await getUserTemplates();
      if (error) {
        console.error("Error loading user templates:", error);
      } else {
        setUserTemplates(data || []);
      }
    } catch (error) {
      console.error("Error loading user templates:", error);
    } finally {
      setIsLoadingUserTemplates(false);
    }
  }, []);

  // User templates are loaded lazily when creating a new gig pack (in openCreatePanel)

  const closePanel = useCallback(() => {
    setActivePanel(null);
    setEditingGigPack(null);
    setIsPanelLoading(false);
  }, []);

  const loadGigPack = useCallback(
    async (gigPackId: string) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("gig_packs")
        .select("*")
        .eq("id", gigPackId)
        .single();

      if (error || !data) {
        toast({
          title: t("unableToLoad"),
          description: t("tryAgain"),
          variant: "destructive",
        });
        closePanel();
      } else {
        setEditingGigPack(data);
      }
      setIsPanelLoading(false);
    },
    [closePanel, toast, t],
  );

  useEffect(() => {
    if (initialSheetState && typeof window !== "undefined") {
      window.history.replaceState(null, "", "/gigpacks");
    }
  }, [initialSheetState]);

  // Open create panel directly (no template chooser)
  const openCreatePanel = () => {
    setEditingGigPack(null);
    loadUserTemplates(); // Refresh templates
    setActivePanel({ mode: "create" });
  };

  const openEditPanel = (gigPackId: string) => {
    setActivePanel({ mode: "edit", gigPackId });
    if (editingGigPack?.id === gigPackId) {
      setIsPanelLoading(false);
      return;
    }
    setEditingGigPack(null);
    setIsPanelLoading(true);
    void loadGigPack(gigPackId);
  };

  const handleCreateSuccess = useCallback(
    (created: GigPack) => {
      setGigPacks((prev) => sortGigPacks([...prev, toListItem(created)]));
      closePanel();
    },
    [closePanel],
  );

  const handleUpdateSuccess = useCallback(
    (updated: GigPack) => {
      setGigPacks((prev) =>
        sortGigPacks(
          prev.map((pack) => (pack.id === updated.id ? toListItem(updated) : pack)),
        ),
      );
      closePanel();
    },
    [closePanel],
  );

  const handleDelete = useCallback(
    async (gigPackId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("gig_packs")
        .delete()
        .eq("id", gigPackId);

      if (error) {
        toast({
          title: tCommon("error"),
          description: t("failedToDelete"),
          variant: "destructive",
        });
        return;
      }

      setGigPacks((prev) => prev.filter((pack) => pack.id !== gigPackId));
      toast({
        title: t("deleted"),
        description: t("deletedDescription"),
        duration: 2000,
      });
    },
    [toast, t, tCommon],
  );

  const handleShare = (gigPackId: string) => {
     // Find the gig pack to get its slug
     const gig = gigPacks.find(g => g.id === gigPackId);
     if (!gig) return;
     
     // Basic share implementation - just copy to clipboard
     const url = `${window.location.origin}/g/${gig.public_slug}`;
     navigator.clipboard.writeText(url).then(() => {
         toast({
             title: "Link copied!",
             description: "Share this link with your bandmates.",
         });
     });
  };

  const isEditMode = activePanel?.mode === "edit";
  const isPanelOpen = !!activePanel && !isPanelLoading;

  return (
    <>
      <div className="space-y-8">
        {/* Dashboard Header - Tour Book Vibe */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-3 mb-2 relative">
              <HandDrawnSquiggle className="text-primary" />
              <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                {t("yourGigs")}
              </span>
              <HandDrawnStar className="text-primary/40 absolute -top-2 -right-6 w-4 h-4 hand-drawn-float" style={{ animationDelay: '0s' }} />
              <HandDrawnStar className="text-primary/30 absolute -bottom-1 -right-10 w-3 h-3 hand-drawn-float" style={{ animationDelay: '2s' }} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {t("description")}
            </p>
          </div>
          <Button 
            onClick={openCreatePanel} 
            size="lg"
            className="sm:w-auto shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="mr-2 h-5 w-5" />
            {t("createGigPack")}
          </Button>
        </div>

        {/* Today / Next Up Strip */}
        <NextUpStrip gigs={filteredGigPacks} />

        {/* Controls Bar: Layout Switcher + Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
             <LayoutSwitcher value={viewMode} onChange={setViewMode} />
             
             <div className="flex items-center gap-4">
                <ViewFilterPills value={viewFilter} onChange={setViewFilter} />
                <p className="text-sm text-muted-foreground min-w-[60px] text-right">
                  {groupedGigs.reduce((acc, group) => acc + group.gigs.length, 0)} gigs
                  {searchQuery && ` (filtered)`}
                </p>
             </div>
        </div>

        {/* View Implementation */}
        <div className="min-h-[400px]">
             {isInitialLoading ? (
               <>
                 {viewMode === "board" && (
                   <div className="space-y-8">
                     <section>
                       <Skeleton className="h-4 w-32 mb-4" />
                       <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                         {Array.from({ length: 6 }).map((_, i) => (
                           <GigPackCardSkeleton key={i} />
                         ))}
                       </div>
                     </section>
                   </div>
                 )}
                 {viewMode === "list" && (
                   <div className="space-y-8">
                     <section>
                       <Skeleton className="h-4 w-32 mb-4" />
                       <GigPackListSkeleton />
                     </section>
                   </div>
                 )}
                 {viewMode === "compact" && (
                   <div className="space-y-8">
                     <section>
                       <Skeleton className="h-4 w-32 mb-4" />
                       <GigPackCompactSkeleton />
                     </section>
                   </div>
                 )}
               </>
             ) : (
               <>
             {viewMode === "board" && (
               <BoardView 
                 groups={groupedGigs}
                 onEdit={openEditPanel}
                 onShare={handleShare}
                 onDelete={handleDelete}
                 onClick={openEditPanel}
                 viewFilter={viewFilter}
                 onCreate={openCreatePanel}
               />
             )}
             
             {viewMode === "list" && (
               <ListView 
                 groups={groupedGigs}
                 onEdit={openEditPanel}
                 onShare={handleShare}
                 onDelete={handleDelete}
                 onClick={openEditPanel}
                 viewFilter={viewFilter}
                 onCreate={openCreatePanel}
               />
             )}
             
             {viewMode === "compact" && (
               <CompactView 
                 groups={groupedGigs}
                 onEdit={openEditPanel}
                 onShare={handleShare}
                 onDelete={handleDelete}
                 onClick={openEditPanel}
                 viewFilter={viewFilter}
                 onCreate={openCreatePanel}
               />
                 )}
               </>
             )}
        </div>
      </div>

      {/* Loading state while fetching gig for edit */}
      {isPanelLoading && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="mb-4 h-8 w-8 animate-spin" />
            {t("loadingGigPack")}
          </div>
        </div>
      )}

      {/* Gig Editor Panel */}
      <GigEditorPanel
        open={isPanelOpen}
        onOpenChange={(open) => {
          if (!open) {
            closePanel();
          }
        }}
        gigPack={isEditMode ? editingGigPack ?? undefined : undefined}
        onCreateSuccess={handleCreateSuccess}
        onUpdateSuccess={handleUpdateSuccess}
        onDelete={async (gigPackId) => {
          await handleDelete(gigPackId);
          closePanel();
        }}
        onTemplateSaved={loadUserTemplates}
        userTemplates={userTemplates}
        onUserTemplatesChange={loadUserTemplates}
        isLoadingUserTemplates={isLoadingUserTemplates}
      />
    </>
  );
}
