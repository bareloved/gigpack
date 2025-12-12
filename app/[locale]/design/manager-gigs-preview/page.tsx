"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Users,
  Zap,
  Sun,
  Moon,
  Globe,
  LayoutGrid,
  List as ListIcon,
  LayoutTemplate,
  MoreVertical,
} from "lucide-react";
import { HandDrawnSquiggle, HandDrawnStar } from "@/components/hand-drawn/accents";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// =============================================================================
// DESIGN LAB: MANAGER GIGS PREVIEW
// =============================================================================
// This is a Design Lab page used to preview and compare different layouts
// for the Manager's Dashboard.
//
// 🛠️ FEATURES:
// - Layout Switcher: Toggle between Board, List, and Compact views.
// - Mock Data: Uses a static array of 8 gigs (no API calls).
// - Shared Logic: All views share the same filtering and grouping logic.
//
// 📦 COMPONENTS:
// - BoardView: The original card-based grid (standard view).
// - ListView: High-density rows for scanning many gigs.
// - CompactView: Simplified cards for a zoomed-out overview.
// =============================================================================

// =============================================================================
// MOCK DATA
// Mock gigs array with ~8 example gigs for preview purposes
// Ready to connect to real data later - just replace with API call results
// =============================================================================

interface MockGig {
  id: string;
  title: string;
  bandName: string;
  date: Date;
  callTime: string; // e.g. "19:00"
  venueName: string;
  status: "Confirmed" | "Draft" | "Cancelled";
  youRole: string; // e.g. "Band leader & keys"
  bandmatesCount: number;
  confirmedCount: number;
}

// Get today's date at midnight for relative date calculations
const today = new Date();
today.setHours(0, 0, 0, 0);

// Helper to create dates relative to today
const daysFromNow = (days: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date;
};

const MOCK_GIGS: MockGig[] = [
  {
    id: "1",
    title: "Sunday Morning Sessions",
    bandName: "The Worship Band",
    date: daysFromNow(0), // Today
    callTime: "09:30",
    venueName: "The Roasted Bean",
    status: "Confirmed",
    youRole: "Band leader & keys",
    bandmatesCount: 4,
    confirmedCount: 4,
  },
  {
    id: "2",
    title: "EMERGENCY SUB – Read Notes!",
    bandName: "TBD",
    date: daysFromNow(2),
    callTime: "18:00",
    venueName: "The Dive Bar",
    status: "Confirmed",
    youRole: "Keys",
    bandmatesCount: 5,
    confirmedCount: 3,
  },
  {
    id: "3",
    title: "Friday Night Jazz",
    bandName: "Blue Note Trio",
    date: daysFromNow(4),
    callTime: "20:00",
    venueName: "The Blue Room",
    status: "Confirmed",
    youRole: "Piano & MD",
    bandmatesCount: 3,
    confirmedCount: 3,
  },
  {
    id: "4",
    title: "Wedding Reception",
    bandName: "The Celebrations",
    date: daysFromNow(10),
    callTime: "16:00",
    venueName: "Grand Ballroom Hotel",
    status: "Draft",
    youRole: "Band leader",
    bandmatesCount: 6,
    confirmedCount: 2,
  },
  {
    id: "5",
    title: "Corporate Event",
    bandName: "Smooth Operators",
    date: daysFromNow(15),
    callTime: "18:30",
    venueName: "Tech Campus Pavilion",
    status: "Confirmed",
    youRole: "Keys & backing vocals",
    bandmatesCount: 5,
    confirmedCount: 5,
  },
  {
    id: "6",
    title: "Club Night Residency",
    bandName: "Electric Dreams",
    date: daysFromNow(22),
    callTime: "22:00",
    venueName: "Neon Underground",
    status: "Confirmed",
    youRole: "Keys & synths",
    bandmatesCount: 4,
    confirmedCount: 4,
  },
  {
    id: "7",
    title: "Last Month's Gig",
    bandName: "The Throwbacks",
    date: daysFromNow(-14),
    callTime: "21:00",
    venueName: "Vinyl Records Bar",
    status: "Confirmed",
    youRole: "Keys",
    bandmatesCount: 5,
    confirmedCount: 5,
  },
  {
    id: "8",
    title: "Cancelled Show",
    bandName: "Weather Permitting",
    date: daysFromNow(8),
    callTime: "14:00",
    venueName: "City Park Amphitheater",
    status: "Cancelled",
    youRole: "Band leader",
    bandmatesCount: 7,
    confirmedCount: 0,
  },
];

// =============================================================================
// HELPER FUNCTIONS
// Date formatting and grouping utilities
// =============================================================================

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const isToday = (date: Date): boolean => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime() === today.getTime();
};

const isThisWeek = (date: Date): boolean => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return d >= today && d < weekEnd;
};

const isThisMonth = (date: Date): boolean => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const monthEnd = new Date(today);
  monthEnd.setDate(monthEnd.getDate() + 30);
  return d >= today && d < monthEnd;
};

const isPast = (date: Date): boolean => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < today;
};

type GigGroup = {
  label: string;
  gigs: MockGig[];
};

const groupGigsByTime = (gigs: MockGig[], filter: ViewFilter): GigGroup[] => {
  if (filter === "past") {
    const pastGigs = gigs.filter((g) => isPast(g.date)).sort((a, b) => b.date.getTime() - a.date.getTime());
    if (pastGigs.length === 0) return [];
    return [{ label: "Past Gigs", gigs: pastGigs }];
  }

  const upcomingGigs = gigs.filter((g) => !isPast(g.date)).sort((a, b) => a.date.getTime() - b.date.getTime());

  const thisWeek = upcomingGigs.filter((g) => isThisWeek(g.date));
  const laterThisMonth = upcomingGigs.filter((g) => !isThisWeek(g.date) && isThisMonth(g.date));
  const otherUpcoming = upcomingGigs.filter((g) => !isThisMonth(g.date));

  const groups: GigGroup[] = [];
  if (thisWeek.length > 0) groups.push({ label: "This Week", gigs: thisWeek });
  if (laterThisMonth.length > 0) groups.push({ label: "Later This Month", gigs: laterThisMonth });
  if (otherUpcoming.length > 0) groups.push({ label: "Other Upcoming", gigs: otherUpcoming });

  if (filter === "all") {
    const pastGigs = gigs.filter((g) => isPast(g.date)).sort((a, b) => b.date.getTime() - a.date.getTime());
    if (pastGigs.length > 0) groups.push({ label: "Past", gigs: pastGigs });
  }

  return groups;
};

// =============================================================================
// STATUS BADGE COMPONENT
// Color-coded status indicator for gig confirmation state
// =============================================================================

const StatusBadge = ({ status, minimal = false }: { status: MockGig["status"]; minimal?: boolean }) => {
  const statusStyles = {
    Confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    Draft: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    Cancelled: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  };

  if (minimal) {
    const dotColors = {
      Confirmed: "bg-emerald-500",
      Draft: "bg-amber-500",
      Cancelled: "bg-red-500",
    };
    return (
      <div className="flex items-center gap-1.5" title={status}>
        <div className={cn("w-2 h-2 rounded-full", dotColors[status])} />
        <span className="text-xs text-muted-foreground font-medium hidden sm:inline-block">{status}</span>
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        statusStyles[status]
      )}
    >
      {status}
    </span>
  );
};

// =============================================================================
// 1. LAYOUT SWITCHER
// =============================================================================

type ViewMode = "board" | "list" | "compact";

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
        Board
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
        List
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
        Compact
      </Button>
    </div>
  );
};

// =============================================================================
// SHARED PROPS FOR ALL VIEWS
// =============================================================================

interface ViewProps {
  groups: GigGroup[];
  onEdit: (id: string) => void;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
  viewFilter: ViewFilter;
}

const EmptyState = ({ viewFilter }: { viewFilter: ViewFilter }) => (
  <Card className="border-2 border-dashed bg-card/50">
    <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="rounded-full bg-muted p-4">
        <Calendar className="h-10 w-10 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-center">
        {viewFilter === "past"
          ? "No past gigs to show."
          : "No upcoming gigs. Time to pack a new one!"}
      </p>
    </CardContent>
  </Card>
);

// =============================================================================
// 2. BOARD VIEW (Original Cards)
// =============================================================================

const ManagerGigCard = ({ gig, onEdit, onShare, onDelete, onClick }: ManagerGigCardProps) => {
  const isTodayGig = isToday(gig.date);
  const isPastGig = isPast(gig.date);
  const allConfirmed = gig.confirmedCount === gig.bandmatesCount;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-2 transition-all duration-200 cursor-pointer",
        "hover:shadow-xl hover:scale-[1.02] hover:border-primary/40",
        isPastGig && "opacity-75",
        gig.status === "Cancelled" && "opacity-60"
      )}
      onClick={() => onClick(gig.id)}
    >
      {/* Today indicator stripe */}
      {isTodayGig && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary" />
      )}

      <CardContent className="p-5 space-y-3">
        {/* Top row: Title + Status */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {gig.title}
          </h3>
          <StatusBadge status={gig.status} />
        </div>

        {/* Band name row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground font-medium">{gig.bandName}</span>
        </div>

        {/* Manager control line */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>You: {gig.youRole}</span>
          <span className="text-muted-foreground/50">•</span>
          <span>{gig.bandmatesCount} bandmates</span>
          <span className="text-muted-foreground/50">•</span>
          <span className={cn(
            "font-medium",
            allConfirmed ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
          )}>
            {gig.confirmedCount}/{gig.bandmatesCount} confirmed
          </span>
        </div>

        {/* Date & Call Time pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {/* Date pill - more prominent */}
          <div className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold border-2",
            isTodayGig
              ? "bg-primary/15 text-primary border-primary/30"
              : "bg-primary/10 text-primary border-primary/20"
          )}>
            <Calendar className="h-3.5 w-3.5" />
            <span>{isTodayGig ? "Today" : formatDate(gig.date)}</span>
          </div>

          {/* Call time pill - secondary styling */}
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1.5 text-sm font-medium text-muted-foreground border border-border/50">
            <Clock className="h-3.5 w-3.5" />
            <span>Call: {gig.callTime}</span>
          </div>
        </div>

        {/* Venue line */}
        <div className="flex items-center gap-2 pt-2 border-t border-dashed border-border">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium text-muted-foreground line-clamp-1">
            {gig.venueName}
          </span>
        </div>

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
};

// ManagerGigCardProps definition reused from previous file
interface ManagerGigCardProps {
  gig: MockGig;
  onEdit: (gigId: string) => void;
  onShare: (gigId: string) => void;
  onDelete: (gigId: string) => void;
  onClick: (gigId: string) => void;
}

const BoardView = ({ groups, onEdit, onShare, onDelete, onClick, viewFilter }: ViewProps) => {
  if (groups.length === 0) return <EmptyState viewFilter={viewFilter} />;

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.label}>
          <SectionHeader label={group.label} />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {group.gigs.map((gig) => (
              <ManagerGigCard
                key={gig.id}
                gig={gig}
                onEdit={onEdit}
                onShare={onShare}
                onDelete={onDelete}
                onClick={onClick}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

// =============================================================================
// 3. LIST VIEW (High-information rows)
// =============================================================================

const ListView = ({ groups, onEdit, onShare, onDelete, onClick, viewFilter }: ViewProps) => {
  if (groups.length === 0) return <EmptyState viewFilter={viewFilter} />;

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.label}>
          <SectionHeader label={group.label} />
          <div className="flex flex-col gap-2">
            {group.gigs.map((gig) => {
              const isTodayGig = isToday(gig.date);
              const allConfirmed = gig.confirmedCount === gig.bandmatesCount;
              
              return (
                <div
                  key={gig.id}
                  className={cn(
                    "group flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer relative",
                    isTodayGig && "border-primary/30 bg-primary/5"
                  )}
                  onClick={() => onClick(gig.id)}
                >
                  {/* Status & Date Column */}
                  <div className="flex items-center gap-3 md:w-48 shrink-0">
                    <div className="flex flex-col">
                      <span className={cn("font-bold text-lg leading-none", isTodayGig && "text-primary")}>
                        {formatDate(gig.date)}
                      </span>
                      <span className="text-sm text-muted-foreground">{gig.callTime}</span>
                    </div>
                    <StatusBadge status={gig.status} minimal />
                  </div>

                  {/* Main Info Column */}
                  <div className="flex-1 min-w-0 grid gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base truncate">{gig.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground/80">{gig.bandName}</span>
                      <span>•</span>
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{gig.venueName}</span>
                    </div>
                  </div>

                  {/* Role & Confirmed Column */}
                  <div className="hidden lg:flex flex-col items-end gap-0.5 text-sm text-muted-foreground w-48 shrink-0">
                     <span className="font-medium text-foreground/80">You: {gig.youRole}</span>
                     <span className={cn(
                        "text-xs",
                        allConfirmed ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      )}>
                       {gig.confirmedCount}/{gig.bandmatesCount} confirmed
                     </span>
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

// =============================================================================
// 4. COMPACT VIEW (Denser cards)
// =============================================================================

const CompactView = ({ groups, onEdit, onShare, onDelete, onClick, viewFilter }: ViewProps) => {
  if (groups.length === 0) return <EmptyState viewFilter={viewFilter} />;

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
                    isTodayGig && "border-primary/30 bg-primary/5"
                  )}
                  onClick={() => onClick(gig.id)}
                >
                  <CardContent className="p-3 space-y-2">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold truncate leading-tight">{gig.title}</span>
                      <StatusBadge status={gig.status} minimal />
                    </div>

                    {/* Time & Location */}
                    <div className="text-sm space-y-0.5 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span className={cn(isTodayGig && "text-primary font-medium")}>
                           {formatDate(gig.date)} • {gig.callTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{gig.venueName}</span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                      <div className="text-xs text-muted-foreground/70 truncate max-w-[60%]">
                        {gig.bandName}
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
// VIEW FILTER PILLS
// Simple segmented control for All | Upcoming | Past views
// =============================================================================

type ViewFilter = "all" | "upcoming" | "past";

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

// =============================================================================
// TODAY / NEXT UP STRIP
// Highlights the most relevant upcoming gig
// =============================================================================

const NextUpStrip = ({ gigs }: { gigs: MockGig[] }) => {
  // Find the next upcoming gig (not cancelled)
  const upcomingGigs = gigs
    .filter((g) => !isPast(g.date) && g.status !== "Cancelled")
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (upcomingGigs.length === 0) return null;

  const nextGig = upcomingGigs[0];
  const isTodayGig = isToday(nextGig.date);

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-xl px-4 py-3 border",
      isTodayGig
        ? "bg-primary/10 border-primary/30"
        : "bg-accent/10 border-accent/30"
    )}>
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full",
        isTodayGig ? "bg-primary/20" : "bg-accent/20"
      )}>
        {isTodayGig ? (
          <Zap className={cn("h-4 w-4", isTodayGig ? "text-primary" : "text-accent")} />
        ) : (
          <Calendar className="h-4 w-4 text-accent" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className={cn(
          "text-xs font-bold uppercase tracking-wider",
          isTodayGig ? "text-primary" : "text-accent"
        )}>
          {isTodayGig ? "Today" : "Next up"}
        </span>
        <p className="text-sm font-medium truncate">
          {nextGig.title} – Call {nextGig.callTime} at {nextGig.venueName}
        </p>
      </div>
    </div>
  );
};

// =============================================================================
// SECTION HEADER
// Simple heading for gig time groups
// =============================================================================

const SectionHeader = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <h2 className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
      {label}
    </h2>
    <div className="flex-1 h-px bg-border/50" />
  </div>
);

// =============================================================================
// MOCK TOP BAR
// Simplified header matching the existing app design
// =============================================================================

const MockTopBar = () => (
  <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container flex h-16 items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">GP</span>
        </div>
        <span className="font-bold text-lg">GigPack</span>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Globe className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <span className="text-xs font-medium">JD</span>
        </div>
      </div>
    </div>
  </header>
);

// =============================================================================
// MAIN PREVIEW PAGE
// Manager Gigs Preview - new improved layout for gig management
// =============================================================================

export default function ManagerGigsPreviewPage() {
  const [viewFilter, setViewFilter] = useState<ViewFilter>("upcoming");
  const [viewMode, setViewMode] = useState<ViewMode>("board");

  // Group gigs by time based on current filter
  const groupedGigs = useMemo(() => {
    return groupGigsByTime(MOCK_GIGS, viewFilter);
  }, [viewFilter]);

  // Event handlers - for preview, these just log to console
  const handleEdit = (gigId: string) => {
    console.log(`[Preview] Edit gig: ${gigId}`);
  };

  const handleShare = (gigId: string) => {
    console.log(`[Preview] Share gig: ${gigId}`);
  };

  const handleDelete = (gigId: string) => {
    console.log(`[Preview] Delete gig: ${gigId}`);
  };

  const handleCardClick = (gigId: string) => {
    console.log(`[Preview] Card clicked: ${gigId}`);
  };

  const handleCreate = () => {
    console.log("[Preview] Create new gig");
  };

  // Log preview info on mount
  if (typeof window !== "undefined") {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║  🎸 MANAGER GIGS PREVIEW - DESIGN LAB                             ║
╠═══════════════════════════════════════════════════════════════════╣
║  📍 Route: /en/design/manager-gigs-preview                        ║
║  🎛️ Current Mode: ${viewMode.toUpperCase()}                                       ║
║                                                                   ║
║  COMPONENTS:                                                      ║
║  • BoardView: Original card grid                                  ║
║  • ListView: High-info rows                                       ║
║  • CompactView: Dense cards                                       ║
╚═══════════════════════════════════════════════════════════════════╝
    `);
  }

  return (
    <div className="min-h-screen bg-background">
      <MockTopBar />

      <main className="container py-8">
        <div className="space-y-8">
          {/* Dashboard Header */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 mb-2 relative">
                <HandDrawnSquiggle className="text-primary" />
                <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                  Your gigs
                </span>
                <HandDrawnStar
                  className="text-primary/40 absolute -top-2 -right-6 w-4 h-4 hand-drawn-float"
                  style={{ animationDelay: "0s" }}
                />
                <HandDrawnStar
                  className="text-primary/30 absolute -bottom-1 -right-10 w-3 h-3 hand-drawn-float"
                  style={{ animationDelay: "2s" }}
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Your gigs</h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Pack all the details your bandmates need—times, setlist, venue, who&apos;s
                playing—into one shareable page.
              </p>
            </div>
            <Button
              onClick={handleCreate}
              size="lg"
              className="sm:w-auto shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="mr-2 h-5 w-5" />
              Pack a new gig
            </Button>
          </div>

          {/* Today / Next Up Strip */}
          <NextUpStrip gigs={MOCK_GIGS} />

          {/* Controls Bar: Layout Switcher + Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
             <LayoutSwitcher value={viewMode} onChange={setViewMode} />
             
             <div className="flex items-center gap-4">
                <ViewFilterPills value={viewFilter} onChange={setViewFilter} />
                <p className="text-sm text-muted-foreground min-w-[60px] text-right">
                  {groupedGigs.reduce((acc, group) => acc + group.gigs.length, 0)} gigs
                </p>
             </div>
          </div>

          {/* View Implementation */}
          <div className="min-h-[400px]">
             {viewMode === "board" && (
               <BoardView 
                 groups={groupedGigs}
                 onEdit={handleEdit}
                 onShare={handleShare}
                 onDelete={handleDelete}
                 onClick={handleCardClick}
                 viewFilter={viewFilter}
               />
             )}
             
             {viewMode === "list" && (
               <ListView 
                 groups={groupedGigs}
                 onEdit={handleEdit}
                 onShare={handleShare}
                 onDelete={handleDelete}
                 onClick={handleCardClick}
                 viewFilter={viewFilter}
               />
             )}
             
             {viewMode === "compact" && (
               <CompactView 
                 groups={groupedGigs}
                 onEdit={handleEdit}
                 onShare={handleShare}
                 onDelete={handleDelete}
                 onClick={handleCardClick}
                 viewFilter={viewFilter}
               />
             )}
          </div>

          {/* Preview Mode Banner */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
            <Badge
              variant="secondary"
              className="bg-violet-600/90 text-white border-violet-500 px-4 py-2 text-sm shadow-lg backdrop-blur-sm"
            >
              🎨 Design Lab — {viewMode === "board" ? "Board View" : viewMode === "list" ? "List View" : "Compact View"}
            </Badge>
          </div>
        </div>
      </main>
    </div>
  );
}
