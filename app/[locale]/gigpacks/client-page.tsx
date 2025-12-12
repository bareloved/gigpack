"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";
import { GigEditorPanel } from "@/components/gig-editor-panel";
import { GigPackShareDialog } from "@/components/gigpack-share-dialog";
import { BoardView, ListView, CompactView, type GigGroup } from "@/components/gigpacks/views";
import type { GigPack, UserTemplate } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { getUserTemplates } from "@/lib/userTemplates";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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

// Helper to generate group labels with translation function
const groupGigsByTime = (gigs: GigPackListItem[], filter: ViewFilter, t: (key: string) => string): GigGroup[] => {
  if (filter === "past") {
    const pastGigs = sortPastGigs(gigs);
    if (pastGigs.length === 0) return [];
    return [{ label: t("sectionPastGigs"), gigs: pastGigs }];
  }

  const upcomingGigs = sortUpcomingGigs(gigs);
  const thisWeek = upcomingGigs.filter((g) => isThisWeek(g.date));
  const laterThisMonth = upcomingGigs.filter((g) => !isThisWeek(g.date) && isThisMonth(g.date));
  const otherUpcoming = upcomingGigs.filter((g) => !isThisMonth(g.date));

  const groups: GigGroup[] = [];
  if (thisWeek.length > 0) groups.push({ label: t("sectionThisWeek"), gigs: thisWeek });
  if (laterThisMonth.length > 0) groups.push({ label: t("sectionLaterThisMonth"), gigs: laterThisMonth });
  if (otherUpcoming.length > 0) groups.push({ label: t("sectionOtherUpcoming"), gigs: otherUpcoming });

  if (filter === "all") {
    const pastGigs = sortPastGigs(gigs);
    if (pastGigs.length > 0) groups.push({ label: t("filterPast"), gigs: pastGigs });
  }

  // Handle unscheduled gigs
  const groupedIds = new Set(groups.flatMap(g => g.gigs.map(gig => gig.id)));
  const leftovers = upcomingGigs.filter(g => !groupedIds.has(g.id));

  if (leftovers.length > 0) {
    groups.push({ label: t("sectionUnscheduled"), gigs: leftovers });
  }

  return groups;
};

const LayoutSwitcher = ({
  value,
  onChange,
  t,
}: {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  t: (key: string) => string;
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
        <LayoutGrid className="mx-2 h-4 w-4" />
        <span className="hidden sm:inline">{t("viewBoard")}</span>
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
        <ListIcon className="mx-2 h-4 w-4" />
        <span className="hidden sm:inline">{t("viewList")}</span>
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
        <LayoutTemplate className="mx-2 h-4 w-4" />
        <span className="hidden sm:inline">{t("viewCompact")}</span>
      </Button>
    </div>
  );
};

const ViewFilterPills = ({
  value,
  onChange,
  t,
}: {
  value: ViewFilter;
  onChange: (filter: ViewFilter) => void;
  t: (key: string) => string;
}) => {
  const filters: { key: ViewFilter; labelKey: string }[] = [
    { key: "all", labelKey: "filterAll" },
    { key: "upcoming", labelKey: "filterUpcoming" },
    { key: "past", labelKey: "filterPast" },
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
          {t(filter.labelKey)}
        </button>
      ))}
    </div>
  );
};

const NextUpStrip = ({ gigs, t }: { gigs: GigPackListItem[]; t: (key: string) => string }) => {
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
          {isTodayGig ? t("today") : t("nextUp")}
        </span>
        <p className="text-sm font-medium truncate text-slate-800 dark:text-slate-200">
          {nextGig.title}
          {nextGig.call_time && ` – ${t("callPrefix")} ${nextGig.call_time}`}
          {nextGig.venue_name && ` ${t("atVenue")}${nextGig.venue_name}`}
        </p>
      </div>
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
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const tGigsList = useTranslations("gigsList");
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

  // Share dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedGigPack, setSelectedGigPack] = useState<GigPackListItem | null>(null);

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
    return groupGigsByTime(filteredGigPacks, viewFilter, tGigsList);
  }, [filteredGigPacks, viewFilter, tGigsList]);

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

    setSelectedGigPack(gig);
    setShareDialogOpen(true);
  };

  const isEditMode = activePanel?.mode === "edit";
  const isPanelOpen = !!activePanel && !isPanelLoading;

  return (
    <>
      <div className="space-y-8">
        {/* Dashboard Header - Tour Book Vibe */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
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
        <NextUpStrip gigs={filteredGigPacks} t={tGigsList} />

        {/* Controls Bar: Layout Switcher + Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
             <LayoutSwitcher value={viewMode} onChange={setViewMode} t={tGigsList} />

             <div className="flex items-center gap-4">
                <ViewFilterPills value={viewFilter} onChange={setViewFilter} t={tGigsList} />
                <p className="text-sm text-muted-foreground min-w-[60px] text-right">
                  {groupedGigs.reduce((acc, group) => acc + group.gigs.length, 0)} {tGigsList("gigsCount")}
                  {searchQuery && ` ${tGigsList("filtered")}`}
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
                 t={tGigsList}
                 tCommon={tCommon}
                 locale={locale}
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
                 t={tGigsList}
                 tCommon={tCommon}
                 locale={locale}
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
                 t={tGigsList}
                 tCommon={tCommon}
                 locale={locale}
               />
                 )}
               </>
             )}
        </div>
      </div>

      {/* Loading state while fetching gig for edit */}
      {isPanelLoading && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
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

      {/* Share Dialog */}
      {selectedGigPack && (
        <GigPackShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          gigPack={selectedGigPack}
          locale={locale}
        />
      )}
    </>
  );
}
